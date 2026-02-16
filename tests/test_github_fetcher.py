import os
import json
import pytest
from unittest.mock import MagicMock, patch, mock_open
from scripts.modules.github_fetcher import fetch_github_data

MOCK_CONFIG = {
    "github_username": "testuser",
    "paths": {"output_data": "public/data.json"}
}

@patch("scripts.modules.github_fetcher.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.github_fetcher.Github")
def test_fetch_github_data_success(MockGithub, mock_config):
    # Setup GitHub Mock
    mock_gh_instance = MockGithub.return_value
    mock_user = MagicMock()
    mock_gh_instance.get_user.return_value = mock_user
    
    mock_repo1 = MagicMock()
    mock_repo1.name = "repo1"
    mock_repo1.description = "desc1"
    mock_repo1.language = "Python"
    mock_repo1.stargazers_count = 10
    mock_repo1.forks_count = 2
    mock_repo1.html_url = "http://repo1"
    mock_repo1.homepage = "http://home1"
    mock_repo1.fork = False
    mock_repo1.get_topics.return_value = ["topic1"]
    mock_repo1.updated_at.isoformat.return_value = "2023-01-01"

    mock_repo2 = MagicMock()
    mock_repo2.name = "repo2"
    mock_repo2.fork = True # Should be skipped
    
    mock_user.get_repos.return_value = [mock_repo1, mock_repo2]
    
    # Setup File Mock
    mock_existing_data = {"repos": []}
    m = mock_open(read_data=json.dumps(mock_existing_data))
    
    with patch("builtins.open", m):
        result = fetch_github_data(verbose=True)
        
        assert result is True
        
        # Verify write
        handle = m()
        handle.write.assert_called()
        written_content = "".join(call.args[0] for call in handle.write.call_args_list)
        written_json = json.loads(written_content)
        
        assert len(written_json["repos"]) == 1
        assert written_json["repos"][0]["name"] == "repo1"

@patch("scripts.modules.github_fetcher.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.github_fetcher.Github")
def test_fetch_github_data_exception(MockGithub, mock_config):
    MockGithub.side_effect = Exception("API Error")
    result = fetch_github_data()
    assert result is False

@patch("scripts.modules.github_fetcher.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.github_fetcher.Github")
def test_fetch_github_token_usage(MockGithub, mock_config):
    with patch.dict(os.environ, {"GITHUB_TOKEN": "secret_token"}):
        fetch_github_data()
        MockGithub.assert_called_with("secret_token")

@patch("scripts.modules.github_fetcher.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.github_fetcher.Github")
def test_fetch_github_no_token(MockGithub, mock_config):
    with patch.dict(os.environ, {}, clear=True):
        fetch_github_data()
        MockGithub.assert_called_with()
