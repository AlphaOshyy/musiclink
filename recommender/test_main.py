from math import isclose
from main import Candidate, score, reverse_score, rank, Request, role_match, evaluate_ranking

def fixture():
    return {"genres":["Trap"],"requiredSkills":["Producing"],"requiredRoles":["Producer"],"creativeTags":["Dark"]}

def creator(**kwargs):
    values={"id":"artist1","profession":"Producer","genres":["Trap"],"skills":["Producing"],
            "creativeTags":["Dark"],"available":True,"portfolio":[{"genres":["Trap"],"tags":["Dark"]}]}
    values.update(kwargs)
    return Candidate(**values)

def test_perfect_match():
    project=fixture()
    value,factors=score(project,creator())
    assert value==100 and all(x==100 for x in factors.values())
    ranked=rank(Request(project=project,candidates=[creator()]))
    assert ranked["ranked"][0]["score"]==100
    assert ranked["summary"]["topMatches"]==1

def test_availability():
    c=creator(available=False)
    val,factors=score(fixture(),c)
    assert val==90
    assert reverse_score(fixture(),c)==90

def test_preferences_change_rank():
    project=fixture()
    a=creator(id="a",preferredGenres=["Trap"])
    b=creator(id="b",preferredGenres=["Jazz"])
    result=rank(Request(project=project,candidates=[b,a]))
    assert result["ranked"][0]["id"]=="a"

def test_missing_skills_not_hidden_by_matching_role():
    val,factors=score({"requiredSkills":["Mixing"]},creator(skills=[],portfolio=[]))
    assert factors["skills"]==0
    assert role_match(["Vocalist"],"Singer")==100
    assert role_match(["Mastering Engineer"],"Rapper")==0

def test_determinism_baselines_and_evidence():
    p=fixture()
    one=rank(Request(project=p,candidates=[creator(id="z"),creator(id="a")]))
    two=rank(Request(project=p,candidates=[creator(id="a"),creator(id="z")]))
    assert one==two
    assert one["ranked"][0]["evidence"]["specifiedRequirements"]==4
    assert evaluate_ranking([])["candidateCount"]==0
