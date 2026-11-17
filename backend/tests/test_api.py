
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200


def test_api_routes_registered():
    response = client.get("/openapi.json")
    assert response.status_code == 200

    paths = response.json()["paths"]

    assert "/chat/ask" in paths
    assert "/chat/conversations" in paths
    assert "/documents/upload" in paths
    assert "/coding/assist" in paths
    assert "/learning/performance" in paths
    assert "/learning/recommendations" in paths
    assert "/learning/adaptive-level" in paths
def test_coding_assistant_invalid_language():
    response = client.post(
        "/coding/assist",
        json={
            "language": "javascript",
            "task": "explain",
            "code": "console.log('Hello')",
            "question": "Explain this code"
        }
    )

    assert response.status_code == 400
def test_document_upload_rejects_invalid_file():
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "sample.exe",
                b"invalid file content",
                "application/octet-stream"
            )
        }
    )

    assert response.status_code == 400
