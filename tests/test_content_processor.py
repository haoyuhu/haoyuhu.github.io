import os
import json
import pytest
from unittest.mock import MagicMock, patch, mock_open, call
from scripts.modules.content_processor import update_content, process_content_folder

MOCK_CONFIG = {
    "model": {"name": "gemini-test"},
    "prompts": {
        "garden_system": "garden_sys",
        "article_system": "article_sys"
    },
    "paths": {"output_data": "public/data.json"}
}

@patch("scripts.modules.content_processor.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.content_processor.get_ai_client")
@patch("scripts.modules.content_processor.generate_content")
@patch("glob.glob")
@patch("os.path.exists", return_value=True)
def test_process_content_folder(mock_exists, mock_glob, mock_gen, mock_client, mock_config):
    mock_glob.return_value = ["note1.md"]
    mock_gen.return_value = '{"title": "Note 1"}'
    
    with patch("builtins.open", mock_open(read_data="Raw content")):
        items = process_content_folder("/path/to/folder", "note", "sys_prompt", verbose=True)
        
        assert len(items) == 1
        assert items[0]["title"] == "Note 1"
        assert items[0]["postType"] == "note"
        assert items[0]["originalFile"] == "note1.md"

@patch("scripts.modules.content_processor.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.content_processor.process_content_folder")
def test_update_content_success(mock_process, mock_config):
    # Setup mocks
    mock_process.side_effect = [
        [{"title": "Note 1", "postType": "note"}], # Garden
        [{"title": "Article 1", "postType": "article"}] # Articles
    ]
    
    mock_existing_data = {"blogs": []}
    m = mock_open(read_data=json.dumps(mock_existing_data))
    
    with patch("builtins.open", m):
        result = update_content(verbose=True)
        
        assert result is True
        assert mock_process.call_count == 2
        
        handle = m()
        handle.write.assert_called()
        written_content = "".join(call.args[0] for call in handle.write.call_args_list)
        written_json = json.loads(written_content)
        
        assert len(written_json["blogs"]) == 2
        assert written_json["blogs"][0]["title"] == "Note 1"

@patch("scripts.modules.content_processor.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.content_processor.process_content_folder", return_value=[])
def test_update_content_no_new_items(mock_process, mock_config):
    mock_existing_data = {"blogs": [{"title": "Old"}]}
    m = mock_open(read_data=json.dumps(mock_existing_data))
    
    with patch("builtins.open", m):
        result = update_content(verbose=True)
        
        assert result is True
        handle = m()
        handle.write.assert_not_called()

@patch("scripts.modules.content_processor.load_config", return_value=MOCK_CONFIG)
@patch("os.makedirs")
@patch("os.path.exists", return_value=False)
def test_process_content_folder_creates_dir(mock_exists, mock_makedirs, mock_config):
    items = process_content_folder("/new/path", "note", "sys", verbose=True)
    assert items == []
    mock_makedirs.assert_called_with("/new/path")
