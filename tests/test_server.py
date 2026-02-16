import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.server import app

client = TestClient(app)

# Mock Data
MOCK_DATA = {
    "profile": {"name": "Test User"},
    "experience": [{"role": "Engineer"}],
    "education": [],
    "skills": [],
    "repos": [{"name": "repo1", "stars": 10}, {"name": "repo2", "stars": 5}],
    "blogs": [
        {"postType": "note", "title": "Note1", "summary": "Sum1", "content": "Content1"},
        {"postType": "article", "title": "Art1", "summary": "Sum2", "content": "Content2"}
    ]
}

@patch("backend.server.load_data", return_value=MOCK_DATA)
@patch("backend.server.get_ai_client")
def test_chat_global_success(mock_get_client, mock_load_data):
    # Setup Mock for stream
    mock_ai_instance = MagicMock()
    mock_get_client.return_value = mock_ai_instance
    
    # Synchronous generator for synchronous iteration
    def mock_stream(*args, **kwargs):
        yield MagicMock(text="Hello")
        yield MagicMock(text=" World")

    mock_ai_instance.models.generate_content_stream = mock_stream
    
    response = client.post("/chat", json={"query": "Who are you?", "target": "global"})
    
    assert response.status_code == 200
    assert "Hello World" in response.text

@patch("backend.server.load_data", return_value=MOCK_DATA)
@patch("backend.server.get_ai_client", return_value=None)
def test_chat_no_ai_client(mock_get_client, mock_load_data):
    response = client.post("/chat", json={"query": "Who are you?"})
    assert response.status_code == 503

@patch("backend.server.load_data", return_value={})
@patch("backend.server.get_ai_client")
def test_chat_no_data(mock_get_client, mock_load_data):
    mock_get_client.return_value = MagicMock()
    response = client.post("/chat", json={"query": "Who are you?"})
    assert response.status_code == 500

@patch("backend.server.load_data", return_value=MOCK_DATA)
@patch("backend.server.get_ai_client")
def test_chat_target_article(mock_get_client, mock_load_data):
    mock_ai_instance = MagicMock()
    mock_get_client.return_value = mock_ai_instance
    
    # Use MagicMock with side_effect to capture calls AND return iterator
    def mock_stream_gen(*args, **kwargs):
        yield MagicMock(text="Article Answer")
        
    mock_method = MagicMock(side_effect=mock_stream_gen)
    mock_ai_instance.models.generate_content_stream = mock_method
    
    response = client.post("/chat", json={"query": "Art1", "target": "article"})
    assert response.status_code == 200
    
    # Check arguments
    args, kwargs = mock_method.call_args
    prompt = kwargs.get('contents')
    assert "Art1" in prompt

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
