from math import sqrt
from typing import Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="MusicLink Recommendation Engine", version="0.1.0")
WEIGHTS = {"genre": .20, "skills": .25, "creative": .25, "portfolio": .20, "availability": .10}

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

def normalize(values):
    return {str(x).strip().casefold() for x in (values or []) if str(x).strip()}

def coverage(requirements, offered, neutral=50.0):
    wanted = normalize(requirements)
    if not wanted:
        return neutral
    return round(100 * len(wanted.intersection(normalize(offered))) / len(wanted), 2)

def score(project: dict, creator: Candidate):
    roles = project.get("requiredRoles", [])
    genre = coverage(project.get("genres"), creator.genres)
    profession_ok = 100.0 if not roles or creator.profession.casefold() in normalize(roles) else 0.0
    skills = .8 * coverage(project.get("requiredSkills"), creator.skills) + .2 * profession_ok
    creative = coverage(project.get("creativeTags"), creator.creativeTags)
    port_genres = []
    port_tags = []
    for entry in creator.portfolio:
        port_genres.extend(entry.get("genres", []))
        port_tags.extend(entry.get("tags", []))
    portfolio = (
        (coverage(project.get("genres"), port_genres) + coverage(project.get("creativeTags"), port_tags)) / 2
        if creator.portfolio else 0.0
    )
    availability = 100.0 if creator.available else 0.0
    factors = {"genre": genre, "skills": round(skills,2), "creative": creative,
               "portfolio": portfolio, "availability": availability}
    return round(sum(factors[key] * weight for key,weight in WEIGHTS.items()), 2), factors

def reverse_score(project: dict, creator: Candidate) -> float:
    prefs = project.get("ownerPreferences", {})
    role_match = coverage(creator.preferredRoles, project.get("requiredRoles"), neutral=100)
    genre_match = coverage(creator.preferredGenres, project.get("genres"), neutral=100)
    tag_match = coverage(creator.preferredTags, project.get("creativeTags"), neutral=100)
    timing = 100 if creator.available else 0
    return round(.30*role_match + .30*genre_match + .30*tag_match + .10*timing, 2)

def explain(factors):
    ordered = sorted(factors.items(), key=lambda item: item[1], reverse=True)
    strengths = [key for key,value in ordered if value >= 70]
    weaknesses = [key for key,value in factors.items() if value < 40]
    if strengths:
        msg = "Strong match on " + ", ".join(strengths[:3]) + "."
    else:
        msg = "Partial compatibility with the project requirements."
    if weaknesses:
        msg += " Review " + ", ".join(weaknesses[:2]) + " before inviting."
    return msg

@app.get("/health")
def health():
    return {"ok": True, "service": "musiclink-recommender"}

@app.post("/rank")
def rank(req: Request):
    ranked=[]
    for creator in req.candidates:
        forward,factors=score(req.project,creator)
        reverse=reverse_score(req.project,creator)
        reciprocal=round(sqrt(forward*reverse),2)
        genre_only=coverage(req.project.get("genres"),creator.genres)
        skills_only=coverage(req.project.get("requiredSkills"),creator.skills)
        ranked.append({
            "id":creator.id, "score":reciprocal, "forward":forward, "reverse":reverse,
            "factors":factors, "explanation":explain(factors),
            "baseline":{"genreOnly":genre_only,"profileSimilarity":round((genre_only+skills_only)/2,2)}
        })
    ranked.sort(key=lambda item: (-item["score"],item["id"]))
    return {"weights":WEIGHTS,"ranked":ranked}
