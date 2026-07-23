from data.mocks import students_subjects


def test_get_all_relations(client):
    response = client.get("/students-subjects/")
    assert response.status_code == 200
    assert response.get_json() == students_subjects


def test_add_relation(client):
    initial_count = len(students_subjects)
    response = client.post(
        "/students-subjects/", json={"student_id": 1, "subject_id": 4}
    )
    assert response.status_code == 201
    assert response.get_json() == {"student_id": 1, "subject_id": 4}
    assert len(students_subjects) == initial_count + 1


def test_add_relation_unknown_student(client):
    response = client.post(
        "/students-subjects/", json={"student_id": 9999, "subject_id": 1}
    )
    assert response.status_code == 404
    assert response.get_json() == {"error": "Student not found"}


def test_add_relation_unknown_subject(client):
    response = client.post(
        "/students-subjects/", json={"student_id": 1, "subject_id": 9999}
    )
    assert response.status_code == 404
    assert response.get_json() == {"error": "Subject not found"}
