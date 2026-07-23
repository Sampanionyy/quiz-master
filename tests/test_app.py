def test_home_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.content_type.startswith("text/html")
