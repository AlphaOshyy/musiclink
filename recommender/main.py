from math import sqrt
from typing import Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="MusicLink MCCA Research Engine", version="0.2.0")
WEIGHTS = {"genre": .20, "skills": .25, "creative": .25, "portfolio": .20, "availability": .10}
ROLE_ALIASES = {
    "producer": {"producer", "music producer", "beat maker", "beatmaker"},
    "vocalist": {"vocalist", "singer", "rapper", "artist", "recording artist"},
    "singer": {"singer", "vocalist", "artist", "recording artist"},
    "rapper": {"rapper", "vocalist", "artist", "recording artist"},
    "mixing engineer": {"mixing engineer", "audio engineer", "mix engineer"},
    "mastering engineer": {"mastering engineer", "audio engineer", "mastering"},
    "songwriter": {"songwriter", "lyricist", "writer"},
    "lyricist": {"lyricist", "songwriter", "writer"},
}

class Candidate(BaseModel):
    id: str
    profession: str = "Artist"
    genres: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    creativeTags: list[str] = Field(default_factory=list)
    available: bool = True
    portfolio: list[dict[str, Any]] = Field(default_factory=list)
    preferredRoles: list[str] = Field(default_factory=list)
    preferredGenres: list[str] = Field(default_factory=list)
    preferredTags: list[str] = Field(default_factory=list)

class Request(BaseModel):
    project: dict[str, Any]
    candidates: list[Candidate]

def normalized(values):
    return {x.strip().casefold() for x in (values or []) if isinstance(x, str) and x.strip()}

def coverage(requirements, offered, neutral=50.0):
    wanted = normalized(requirements)
    return round(100 * len(wanted.intersection(normalized(offered))) / len(wanted), 2) if wanted else neutral

def role_match(roles, profession):
    requirements=normalized(roles)
    if not requirements:
        return 50.0
    actual=(profession or "").strip().casefold()
    return 100.0 if any(role == actual or actual in ROLE_ALIASES.get(role,set()) for role in requirements) else 0.0

def score(project: dict, creator: Candidate):
    required_roles=project.get("requiredRoles", [])
    required_skills=project.get("requiredSkills", [])
    role=role_match(required_roles,creator.profession)
    skills=coverage(required_skills,creator.skills)
    has_skills=bool(normalized(required_skills))
    has_roles=bool(normalized(required_roles))
    blended=round(.8*skills+.2*role,2) if has_skills and has_roles else skills if has_skills else role if has_roles else 50.0
    port_genres=[v for item in creator.portfolio for v in item.get("genres",[])]
    port_tags=[v for item in creator.portfolio for v in item.get("tags",[])]
    portfolio=round((coverage(project.get("genres"),port_genres)+coverage(project.get("creativeTags"),port_tags))/2,2) if creator.portfolio else 0.0
    factors={
        "genre":coverage(project.get("genres"),creator.genres),
        "skills":blended,
        "creative":coverage(project.get("creativeTags"),creator.creativeTags),
        "portfolio":portfolio,
        "availability":100.0 if creator.available else 0.0,
    }
    return round(sum(WEIGHTS[k]*v for k,v in factors.items()),2),factors

def reverse_factors(project: dict,creator: Candidate):
    factors={
        "role":coverage(creator.preferredRoles,project.get("requiredRoles"),neutral=100),
        "genre":coverage(creator.preferredGenres,project.get("genres"),neutral=100),
        "creative":coverage(creator.preferredTags,project.get("creativeTags"),neutral=100),
        "availability":100.0 if creator.available else 0.0,
    }
    return round(.3*factors["role"]+.3*factors["genre"]+.3*factors["creative"]+.1*factors["availability"],2),factors

def reverse_score(project: dict, creator: Candidate):
    return reverse_factors(project,creator)[0]

def explain(factors, creator_score, role):
    names={"genre":"genre","skills":"skills and role","creative":"creative direction","portfolio":"portfolio evidence","availability":"availability"}
    strengths=sorted(((k,v) for k,v in factors.items() if v>=70 and k!="availability"),key=lambda x:-x[1])
    gaps=[names[k] for k,v in factors.items() if v<40 and k!="portfolio"][:2]
    parts=["Strong on "+ " and ".join(names[k] for k,_ in strengths[:2])+"." if strengths else "Limited direct evidence of fit."]
    if gaps: parts.append("Check "+ " and ".join(gaps)+".")
    if factors["portfolio"]==0: parts.append("No relevant portfolio evidence.")
    if factors["availability"]==0: parts.append("Currently unavailable.")
    if creator_score<60: parts.append("Creator preferences may not align.")
    if role==0: parts.append("Requested role is not an exact match.")
    return " ".join(parts)

def evaluate_ranking(ranked):
    if not ranked:
        return {"candidateCount":0,"meanScore":0,"meanGenreBaseline":0,"meanProfileBaseline":0,"topMatches":0}
    avg=lambda k:round(sum(k(x) for x in ranked)/len(ranked),2)
    return {"candidateCount":len(ranked),"meanScore":avg(lambda x:x["score"]),
            "meanGenreBaseline":avg(lambda x:x["baseline"]["genreOnly"]),
            "meanProfileBaseline":avg(lambda x:x["baseline"]["profileSimilarity"]),
            "topMatches":sum(x["score"]>=70 for x in ranked)}

@app.get("/health")
def health():
    return {"ok":True,"service":"musiclink-recommender"}

@app.post("/rank")
def rank(req: Request):
    ranked=[]
    for candidate in req.candidates:
        forward,factors=score(req.project,candidate)
        backward,reverse_details=reverse_factors(req.project,candidate)
        role=role_match(req.project.get("requiredRoles"),candidate.profession)
        genre_only=coverage(req.project.get("genres"),candidate.genres)
        baseline={"genreOnly":genre_only,
                  "profileSimilarity":round((genre_only+coverage(req.project.get("requiredSkills"),candidate.skills))/2,2)}
        ranked.append({
            "id":candidate.id, "score":round(sqrt(forward*backward),2), "forward":forward,
            "reverse":backward, "factors":factors, "reverseFactors":reverse_details,
            "roleMatch":role, "explanation":explain(factors,backward,role),
            "evidence":{"specifiedRequirements":sum(bool(normalized(req.project.get(k))) for k in ("genres","requiredSkills","requiredRoles","creativeTags")),
                        "totalRequirementDimensions":4, "hasPortfolio":bool(candidate.portfolio),"available":candidate.available},
            "baseline":baseline
        })
    ranked.sort(key=lambda x:(-x["score"],x["id"]))
    return {"method":"MCCA-RCC v2","weights":WEIGHTS,"ranked":ranked,
            "summary":evaluate_ranking(ranked)}
