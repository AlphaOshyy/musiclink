from math import isclose
from main import Candidate, score, reverse_score, rank, Request

def test_perfect_forward_match():
    p={"genres":["Trap"],"requiredSkills":["Producing"],"requiredRoles":["Producer"],"creativeTags":["Dark"]}
    c=Candidate(id="1",profession="Producer",genres=["Trap"],skills=["Producing"],creativeTags=["Dark"],available=True,portfolio=[{"genres":["Trap"],"tags":["Dark"]}])
    value,factors=score(p,c)
    assert isclose(value,100.0)
    assert all(v==100 for v in factors.values())

def test_zero_availability_reduces_score():
    project={"genres":["Trap"],"requiredSkills":["Producing"],"requiredRoles":["Producer"],"creativeTags":["Dark"]}
    c=Candidate(id="1",profession="Producer",genres=["Trap"],skills=["Producing"],creativeTags=["Dark"],available=False,portfolio=[{"genres":["Trap"],"tags":["Dark"]}])
    value,_=score(project,c)
    assert value==90.0

def test_reciprocal_score_is_lower_when_preference_mismatch():
    p={"genres":["Trap"],"requiredSkills":["Producing"],"requiredRoles":["Producer"],"creativeTags":["Dark"]}
    good=Candidate(id="1",profession="Producer",genres=["Trap"],skills=["Producing"],creativeTags=["Dark"],portfolio=[{"genres":["Trap"],"tags":["Dark"]}],preferredGenres=["Trap"])
    bad=Candidate(id="2",profession="Producer",genres=["Trap"],skills=["Producing"],creativeTags=["Dark"],portfolio=[{"genres":["Trap"],"tags":["Dark"]}],preferredGenres=["Jazz"])
    result=rank(Request(project=p,candidates=[bad,good]))
    assert result["ranked"][0]["id"]=="1"

def test_missing_requirements_neutral():
    c=Candidate(id="x")
    value,factors=score({},c)
    assert 0<=value<=100
    assert all(0<=v<=100 for v in factors.values())
