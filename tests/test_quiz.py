from data.mocks import QUIZ_QUESTIONS, students


def test_quiz_home(client):
    response = client.get("/quiz")
    assert response.status_code == 200


def test_quiz_play_unknown_category(client):
    response = client.get("/quiz/play/unknown-category")
    assert response.status_code == 404


def test_quiz_play_without_student_redirects_home(client):
    response = client.get("/quiz/play/math")
    assert response.status_code == 302
    assert "/quiz" in response.headers["Location"]


def test_quiz_play_sets_session(client):
    response = client.get("/quiz/play/math?student_id=1")
    assert response.status_code == 200

    with client.session_transaction() as session:
        assert session["quiz_category"] == "math"
        assert session["quiz_student_id"] == 1
        assert session["quiz_started"] is True


def test_quiz_submit_without_session(client):
    response = client.post("/quiz/submit", data={})
    assert response.status_code == 400


def test_quiz_submit_all_correct(client):
    client.get("/quiz/play/math?student_id=1")

    questions = QUIZ_QUESTIONS["math"]
    form_data = {f"question_{q['id']}": q["answer"] for q in questions}

    response = client.post("/quiz/submit", data=form_data)
    assert response.status_code == 200

    with client.session_transaction() as session:
        assert "quiz_category" not in session
        assert "quiz_student_id" not in session


def test_quiz_submit_all_wrong(client):
    client.get("/quiz/play/math?student_id=1")

    questions = QUIZ_QUESTIONS["math"]
    form_data = {f"question_{q['id']}": "clearly-wrong-answer" for q in questions}

    response = client.post("/quiz/submit", data=form_data)
    assert response.status_code == 200


def test_api_leaderboard_sorted_by_score(client):
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == len(students)
    scores = [s["score"] for s in data]
    assert scores == sorted(scores, reverse=True)
