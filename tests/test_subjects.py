import pytest

from data.mocks import subjects


def test_get_subjects_returns_all(client):
    response = client.get("/subjects/")
    assert response.status_code == 200
    assert response.get_json() == subjects


def test_get_subject_by_id(client):
    response = client.get("/subjects/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1
    assert data["name"] == "Mathematics"


def test_get_subject_not_found(client):
    response = client.get("/subjects/9999")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Subject not found"}


def test_create_subject(client):
    initial_count = len(subjects)
    response = client.post("/subjects/", json={"name": "Geography"})
    assert response.status_code == 201
    data = response.get_json()
    assert data == {"id": initial_count + 1, "name": "Geography"}
    assert len(subjects) == initial_count + 1


def test_create_subject_missing_name_raises(client):
    # Known rough edge: no input validation, KeyError on missing "name".
    with pytest.raises(KeyError):
        client.post("/subjects/", json={})
