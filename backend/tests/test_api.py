from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_celebration_includes_twenty_wishes_and_all_real_photos():
    response = client.get("/api/celebration")
    assert response.status_code == 200
    data = response.json()
    assert data["years"] == 20
    assert len(data["wishes"]) == len(set(data["wishes"])) == 20
    assert len(data["photos"]) == 5
    public = Path(__file__).resolve().parents[2] / "frontend" / "public"
    for photo in data["photos"]:
        assert (public / photo["src"].lstrip("/")).is_file()
        assert photo["alt"]
    assert data["letter"]["paragraphs"]

