import pytest

from data.mocks import students


def test_get_students_returns_all(client):
    response = client.get("/students/")
    assert response.status_code == 200
    assert response.get_json() == students


def test_get_student_by_id(client):
    response = client.get("/students/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1
    assert data["name"] == "Moberak"


def test_get_student_not_found(client):
    response = client.get("/students/9999")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Student not found"}


def test_create_student(client):
    initial_count = len(students)
    response = client.post("/students/", json={"name": "Nouveau"})
    assert response.status_code == 201
    data = response.get_json()
    assert data == {"id": initial_count + 1, "name": "Nouveau"}
    assert len(students) == initial_count + 1


def test_create_student_missing_name_raises(client):
    # Known rough edge: no input validation, KeyError on missing "name".
    with pytest.raises(KeyError):
        client.post("/students/", json={})
