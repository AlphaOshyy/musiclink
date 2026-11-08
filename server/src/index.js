import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { User, Project, Application, Invitation } from "./models.js";
import { rank } from "./matcher.js";
import { publicProfile, validateProfile, validatePortfolio, creatorSearch } from "./profile.js";
import { validateProject, validateApplication, validateProjectQuery } from "./projects.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "128kb" }));
app.use((req,res,next)=>{req.body??={};next();});
app.use("/api/auth",(req,res,next)=>{res.setHeader("Cache-Control","no-store");next();});
let connectPromise;
const connectDB=()=>{
  if(mongoose.connection.readyState===1)return Promise.resolve();
  if(!connectPromise)connectPromise=mongoose.connect(process.env.MONGO_URI||"mongodb://127.0.0.1:27017/musiclink").catch(e=>{connectPromise=null;throw e;});
  return connectPromise;
};
app.use("/api",async(req,res,next)=>{
  if(req.path==="/health")return next();
  try{await connectDB();next();}catch(e){next(e);}
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: "draft-7", legacyHeaders: false }));
const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 24 || SECRET.includes("replace-this")) throw new Error("Set a secure JWT_SECRET of at least 24 characters in server/.env");
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const idOk = value => mongoose.isValidObjectId(value);
const cleanTags = value => Array.isArray(value) ? [...new Set(value.filter(v => typeof v === "string").map(v => v.trim().slice(0,48)).filter(Boolean))].slice(0,20) : [];
const sendError = (res, code, message) => res.status(code).json({ error: message });

const blindKey = createHash("sha256").update(SECRET).digest();
function sealCandidate(candidateId, projectId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", blindKey, iv);
  const payload = JSON.stringify({candidateId, projectId, expires:Date.now()+3600000});
  const encrypted = Buffer.concat([cipher.update(payload,"utf8"),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString("base64url");
}
function unsealCandidate(token) {
  const bytes = Buffer.from(token, "base64url");
  if(bytes.length<29)throw Error("Invalid token");
  const decipher=createDecipheriv("aes-256-gcm",blindKey,bytes.subarray(0,12));
  decipher.setAuthTag(bytes.subarray(12,28));
  const payload=JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString("utf8"));
  if(payload.expires<Date.now())throw Error("Expired token");
  return payload;
}
function auth(req,res,next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try { req.auth = jwt.verify(token, SECRET, { issuer:"musiclink", audience:"musiclink-web", algorithms:["HS256"] }); next(); }
  catch { sendError(res,401,"Please log in."); }
}
const mine = async id => await User.findById(id).select("-passwordHash");
const tokenFor = u => jwt.sign({ id:String(u._id), role:u.role }, SECRET, { expiresIn:"7d", issuer:"musiclink", audience:"musiclink-web", algorithm:"HS256" });

app.get("/api/health",(_,res)=>res.json({ok:true,service:"musiclink-api"}));
app.get("/api/health/db",asyncRoute(async(_,res)=>{
  const result=await mongoose.connection.db.admin().ping();
  res.json({ok:result.ok===1,database:"reachable"});
}));
app.post("/api/auth/register",asyncRoute(async(req,res)=>{
  const {email,password,displayName}=req.body;
  if(typeof email!=="string"||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=="string"||password.length<10||password.length>128||typeof displayName!=="string"||displayName.trim().length<2||displayName.trim().length>80) return sendError(res,400,"Provide a valid name, email, and password with at least 10 characters.");
  if(await User.exists({email:email.toLowerCase().trim()})) return sendError(res,409,"Email already registered.");
  const user=await User.create({email:email.toLowerCase().trim(),passwordHash:await bcrypt.hash(password,12),displayName:displayName.trim().slice(0,80)});
  res.status(201).json({token:tokenFor(user),user:publicProfile(user)});
}));
app.post("/api/auth/login",asyncRoute(async(req,res)=>{
  const email=typeof req.body.email==="string"?req.body.email.toLowerCase().trim():"";
  if(email.length>254||typeof req.body.password!=="string"||req.body.password.length>128)return sendError(res,401,"Invalid email or password.");
  const user=await User.findOne({email});
  if(!user||typeof req.body.password!=="string"||!await bcrypt.compare(req.body.password,user.passwordHash)) return sendError(res,401,"Invalid email or password.");
  res.json({token:tokenFor(user),user:publicProfile(user)});
}));
app.get("/api/me",auth,asyncRoute(async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  const user=await mine(req.auth.id);
  if(!user)return sendError(res,401,"Account unavailable.");
  res.json(publicProfile(user));
}));

app.put("/api/me",auth,asyncRoute(async(req,res)=>{
 const parsed=validateProfile(req.body);
 if(parsed.error)return sendError(res,400,parsed.error);
 const user=await User.findByIdAndUpdate(req.auth.id,{$set:parsed.update},{new:true,runValidators:true});
 if(!user)return sendError(res,401,"Account unavailable.");
 res.setHeader("Cache-Control","no-store");res.json(publicProfile(user));
}));
app.post("/api/me/portfolio",auth,asyncRoute(async(req,res)=>{
 const parsed=validatePortfolio(req.body);
 if(parsed.error)return sendError(res,400,parsed.error);
 const user=await User.findById(req.auth.id);
 if(!user)return sendError(res,401,"Account unavailable.");
 if(user.portfolio.length>=25)return sendError(res,400,"Maximum 25 samples.");
 user.portfolio.push(parsed.item);await user.save();res.status(201).json(publicProfile(user));
}));
app.patch("/api/me/portfolio/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid sample ID.");
 const parsed=validatePortfolio(req.body);
 if(parsed.error)return sendError(res,400,parsed.error);
 const user=await User.findById(req.auth.id);
 if(!user)return sendError(res,401,"Account unavailable.");
 const item=user.portfolio.id(req.params.id);
 if(!item)return sendError(res,404,"Sample not found.");
 Object.assign(item,parsed.item);await user.save();res.json(publicProfile(user));
}));
app.patch("/api/me/portfolio/:id/feature",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid sample ID.");
 const user=await User.findById(req.auth.id);
 if(!user)return sendError(res,401,"Account unavailable.");
 const sample=user.portfolio.id(req.params.id);
 if(!sample)return sendError(res,404,"Sample not found.");
 for(const item of user.portfolio)item.featured=String(item._id)===req.params.id;
 await user.save();res.json(publicProfile(user));
}));
app.delete("/api/me/portfolio/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid sample ID.");
 const user=await User.findById(req.auth.id);
 if(!user)return sendError(res,401,"Account unavailable.");
 const item=user.portfolio.id(req.params.id);
 if(!item)return sendError(res,404,"Sample not found.");
 item.deleteOne();await user.save();res.json(publicProfile(user));
}));
app.get("/api/creators",auth,asyncRoute(async(req,res)=>{
 const parsed=creatorSearch(req.query);
 if(parsed.error)return sendError(res,400,parsed.error);
 const users=await User.find({...parsed.filter,_id:{$ne:req.auth.id}})
   .sort({createdAt:-1,_id:-1}).skip((parsed.page-1)*parsed.limit).limit(parsed.limit)
   .select("displayName profession avatarUrl genres skills creativeTags available bio portfolio preferredRoles preferredGenres preferredTags");
 res.setHeader("Cache-Control","private, no-store");res.json(users.map(publicProfile));
}));
app.get("/api/creators/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid creator ID.");
 const user=await User.findById(req.params.id)
  .select("displayName profession avatarUrl genres skills creativeTags available bio portfolio preferredRoles preferredGenres preferredTags");
 if(!user)return sendError(res,404,"Creator not found.");
 res.setHeader("Cache-Control","private, no-store");res.json(publicProfile(user));
}));
app.post("/api/projects",auth,asyncRoute(async(req,res)=>{
 const parsed=validateProject(req.body);
 if(parsed.error)return sendError(res,400,parsed.error);
 const project=await Project.create({owner:req.auth.id,...parsed.update});
 res.status(201).json(project);
}));
app.get("/api/projects",auth,asyncRoute(async(req,res)=>{
 const parsed=validateProjectQuery(req.query);
 if(parsed.error)return sendError(res,400,parsed.error);
 const filter={};
 if(parsed.status!=="all")filter.status=parsed.status;
 if(parsed.mine)filter.owner=req.auth.id;
 const projects=await Project.find(filter).sort({createdAt:-1}).limit(100).populate("owner","displayName profession");
 res.json(projects);
}));
app.get("/api/projects/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid project.");
 const project=await Project.findById(req.params.id).populate("owner","displayName profession");
 if(!project)return sendError(res,404,"Project not found.");
 res.json(project);
}));
app.patch("/api/projects/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid project.");
 const parsed=validateProject(req.body,{partial:true});
 if(parsed.error)return sendError(res,400,parsed.error);
 const project=await Project.findById(req.params.id);
 if(!project)return sendError(res,404,"Project not found.");
 if(String(project.owner)!==req.auth.id)return sendError(res,403,"Only the owner may edit this project.");
 Object.assign(project,parsed.update);await project.save();
 res.json(project);
}));
app.post("/api/projects/:id/apply",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid project.");
 const parsed=validateApplication(req.body);
 if(parsed.error)return sendError(res,400,parsed.error);
 const project=await Project.findById(req.params.id);
 if(!project||project.status!=="open")return sendError(res,404,"Open project not found.");
 if(String(project.owner)===req.auth.id)return sendError(res,400,"You cannot apply to your own project.");
 if(await Application.exists({project:project._id,creator:req.auth.id}))return sendError(res,409,"You already applied.");
 const appRecord=await Application.create({project:project._id,creator:req.auth.id,note:parsed.note});
 res.status(201).json(appRecord);
}));
app.get("/api/me/applications",auth,asyncRoute(async(req,res)=>{
 const items=await Application.find({creator:req.auth.id}).sort({createdAt:-1}).limit(100).populate("project","title status");
 res.json(items);
}));
app.get("/api/projects/:id/applications",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid project.");
 const project=await Project.findById(req.params.id);
 if(!project||String(project.owner)!==req.auth.id)return sendError(res,403,"Only the owner may view applications.");
 const apps=await Application.find({project:project._id}).sort({createdAt:-1}).populate("creator","displayName profession genres skills avatarUrl");
 res.json(apps);
}));
app.patch("/api/applications/:id",auth,asyncRoute(async(req,res)=>{
 if(!idOk(req.params.id))return sendError(res,400,"Invalid application.");
 if(!["accepted","rejected"].includes(req.body.status)||Object.keys(req.body).some(k=>k!=="status"))return sendError(res,400,"Invalid application status.");
 const application=await Application.findById(req.params.id).populate("project");
 if(!application||!application.project)return sendError(res,404,"Application not found.");
 if(String(application.project.owner)!==req.auth.id)return sendError(res,403,"Only the project owner may review applications.");
 if(application.status!=="pending")return sendError(res,409,"Application was already reviewed.");
 if(application.project.status!=="open")return sendError(res,409,"This project is closed.");
 application.status=req.body.status;await application.save();res.json(application);
}));
app.get("/api/invitations",auth,asyncRoute(async(req,res)=>{
  const invites=await Invitation.find({receiver:req.auth.id}).populate("project","title").populate("sender","displayName");
  res.json(invites);
}));
app.post("/api/projects/:id/invite",auth,asyncRoute(async(req,res)=>{
  if(!idOk(req.params.id)||!idOk(req.body.receiverId))return sendError(res,400,"Invalid IDs.");
  const project=await Project.findById(req.params.id);
  if(!project||String(project.owner)!==req.auth.id)return sendError(res,403,"Only the owner may invite.");
  if(!project.shortlist.some(id=>String(id)===req.body.receiverId))return sendError(res,403,"Shortlist the candidate first.");
  const invite=await Invitation.findOneAndUpdate({project:project._id,receiver:req.body.receiverId},{$setOnInsert:{sender:req.auth.id,status:"pending"}},{upsert:true,new:true,setDefaultsOnInsert:true});
  res.status(201).json(invite);
}));
app.patch("/api/invitations/:id",auth,asyncRoute(async(req,res)=>{
  if(!idOk(req.params.id))return sendError(res,400,"Invalid invitation.");
  const invite=await Invitation.findById(req.params.id);
  if(!invite||String(invite.receiver)!==req.auth.id)return sendError(res,403,"Invitation unavailable.");
  if(!["accepted","declined"].includes(req.body.status))return sendError(res,400,"Invalid status.");
  invite.status=req.body.status;await invite.save();res.json(invite);
}));
app.get("/api/projects/:id/recommendations",auth,asyncRoute(async(req,res)=>{
  if(!idOk(req.params.id))return sendError(res,400,"Invalid project.");
  const project=await Project.findById(req.params.id);
  if(!project||String(project.owner)!==req.auth.id)return sendError(res,403,"Only the project owner may view recommendations.");
  const owner=await User.findById(req.auth.id);
  const candidates=await User.find({_id:{$ne:req.auth.id}}).limit(500);
  const result=rank({...project.toObject(),ownerPreferences:{roles:owner.preferredRoles,genres:owner.preferredGenres,tags:owner.preferredTags}},candidates);
  const blind=req.query.mode!=="visible";
  const byId=new Map(candidates.map(u=>[String(u._id),u]));
  const ranked=result.ranked.map((item,i)=>{
    const user=byId.get(item.id);
    const shortlisted=project.shortlist.some(id=>String(id)===item.id);
    const showIdentity=!blind||shortlisted;
    const identity=showIdentity?{id:item.id,displayName:user.displayName,profession:user.profession,portfolio:user.portfolio.map(x=>({title:x.title,url:x.url}))}:{anonymousRef:"Candidate "+String(i+1).padStart(2,"0"),profession:user.profession};
    const matchToken=showIdentity?item.id:sealCandidate(item.id,String(project._id));
    return { ...identity,matchId:matchToken,shortlisted,score:item.score,forward:item.forward,reverse:item.reverse,factors:item.factors,explanation:item.explanation,baseline:item.baseline,
      genres:user.genres,skills:user.skills,creativeTags:user.creativeTags,available:user.available };
  });
  res.json({mode:blind?"blind":"visible",weights:result.weights,ranked});
}));
app.post("/api/projects/:id/shortlist",auth,asyncRoute(async(req,res)=>{
  if(!idOk(req.params.id)||typeof req.body.candidateId!=="string")return sendError(res,400,"Invalid IDs.");
  const project=await Project.findById(req.params.id);
  if(!project||String(project.owner)!==req.auth.id)return sendError(res,403,"Only the owner may shortlist.");
  let candidateId=req.body.candidateId;
  if(!idOk(candidateId)){
    try{
      const payload=unsealCandidate(candidateId);
      if(payload.projectId!==String(project._id))return sendError(res,400,"Invalid candidate token.");
      candidateId=payload.candidateId;
    }catch{return sendError(res,400,"Invalid or expired candidate token.");}
  }
  if(String(project.owner)===candidateId||!await User.exists({_id:candidateId}))return sendError(res,400,"Invalid candidate.");
  if(!project.shortlist.some(id=>String(id)===candidateId))project.shortlist.push(candidateId);
  await project.save();res.json({shortlist:project.shortlist});
}));
app.use((err,req,res,next)=>{
  console.error(err);
  if(err.name==="ValidationError"||err.name==="CastError")return sendError(res,400,"Invalid submitted data.");
  if(err.code===11000)return sendError(res,409,"Record already exists.");
  sendError(res,500,"Server error.");
});
const port=Number(process.env.PORT||4000);
if(process.env.VERCEL!=="1"){
  await connectDB();
  app.listen(port,()=>console.log("MusicLink API running on port "+port));
}
export default app;
