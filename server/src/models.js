import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true };
const str = { type: String, trim: true };
const tags = () => [{ type: String, trim: true }];

const User = model("User", new Schema({
  email: { type: String, unique: true, lowercase: true, required: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  avatarUrl: { type: String, default: "", maxlength: 500 },
  role: { type: String, enum: ["creator", "admin"], default: "creator" },
  genres: tags(), skills: tags(), creativeTags: tags(),
  profession: { type: String, default: "Artist" },
  bio: { type: String, default: "", maxlength: 1500 },
  available: { type: Boolean, default: true },
  preferredRoles: tags(), preferredGenres: tags(), preferredTags: tags(),
  portfolio: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: "", maxlength: 350 },
    role: { type: String, default: "", maxlength: 80 },
    releaseYear: { type: Number, default: null, min: 1900, max: 2100 },
    featured: { type: Boolean, default: false },
    genres: tags(), tags: tags()
  }],
  verifiedAt: { type: Date, default: null },
  verifiedArtistName: { type: String, default: "", maxlength: 80 },
  verifiedPlatform: { type: String, default: "" },
  followerCount: { type: Number, default: 0, min: 0 }
}, opts));

const Project = model("Project", new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { ...str, required: true, maxlength: 120 },
  description: { type: String, maxlength: 2000, default: "" },
  requiredRoles: tags(), requiredSkills: tags(), genres: tags(), creativeTags: tags(),
  targetDate: { type: Date, default: null },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  shortlist: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, opts));

const Application = model("Application", new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String, default: "", maxlength: 600 },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, opts));
Application.schema.index({ project: 1, creator: 1 }, { unique: true });

const Invitation = model("Invitation", new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, opts));
Invitation.schema.index({ project: 1, receiver: 1 }, { unique: true });

const VerificationRequest = model("VerificationRequest", new Schema({
 artist: {type:Schema.Types.ObjectId,ref:"User",required:true,unique:true,index:true},
 artistName: {type:String,required:true,maxlength:80},
 platform: {type:String,required:true,enum:["website","youtube","spotify","soundcloud","instagram","other"]},
 officialUrl: {type:String,required:true,maxlength:500},
 proofCode: {type:String,required:true},
 notes: {type:String,default:"",maxlength:600},
 status: {type:String,enum:["pending","approved","rejected","revoked"],default:"pending",index:true},
 reviewedBy: {type:Schema.Types.ObjectId,ref:"User",default:null},
 reviewedAt: {type:Date,default:null},
 reviewReason: {type:String,default:"",maxlength:500}
},opts));
const AudioSample = model("AudioSample",new Schema({
 owner:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,required:true,maxlength:100},
 kind:{type:String,enum:["music","vocal"],required:true},
 mimeType:{type:String,enum:["audio/mpeg","audio/wav"],required:true},
 byteSize:{type:Number,required:true,max:2097152},
 analysis:{type:Schema.Types.Mixed,default:null,select:false},
 audio:{type:Buffer,required:true,select:false}
},opts));
export { User, Project, Application, Invitation, VerificationRequest, AudioSample };
