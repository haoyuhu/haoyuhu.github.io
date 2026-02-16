import os
import pytest
from unittest.mock import patch, mock_open, MagicMock
from scripts.utils import load_config, get_ai_client, generate_content

# Test load_config
def test_load_config_success():
    mock_yaml_content = """
    github_username: "testuser"
    model:
      name: "test-model"
    """
    with patch("builtins.open", mock_open(read_data=mock_yaml_content)):
        with patch("yaml.safe_load", return_value={"github_username": "testuser", "model": {"name": "test-model"}}):
            config = load_config()
            assert config["github_username"] == "testuser"
            assert config["model"]["name"] == "test-model"

def test_load_config_file_not_found():
    with patch("builtins.open", side_effect=FileNotFoundError):
        with pytest.raises(FileNotFoundError):
            load_config()

# Test get_ai_client
def test_get_ai_client_success():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"}):
        with patch("scripts.utils.Client") as MockClient:
            client = get_ai_client()
            MockClient.assert_called_once_with(api_key="fake_key")
            assert client is not None

def test_get_ai_client_missing_key():
    with patch.dict(os.environ, {}, clear=True):
        client = get_ai_client()
        assert client is None

# Test generate_content
def test_generate_content_success():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"key": "value"}'
    mock_client.models.generate_content.return_value = mock_response

    result = generate_content(mock_client, "model-x", "sys-prompt", "user-content")
    
    assert result == '{"key": "value"}'
    mock_client.models.generate_content.assert_called_once()

def test_generate_content_no_client():
    result = generate_content(None, "model-x", "sys-prompt", "user-content")
    assert result is None

def test_generate_content_exception():
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = Exception("API Error")
    
    result = generate_content(mock_client, "model-x", "sys-prompt", "user-content")
    assert result is None
