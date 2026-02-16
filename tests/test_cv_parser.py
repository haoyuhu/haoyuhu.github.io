import os
import json
import glob
from unittest.mock import MagicMock, patch, mock_open
from scripts.modules.cv_parser import process_cv, extract_text_from_pdf

# Mock config data
MOCK_CONFIG = {
    "prompts": {"cv_system": "sys_prompt"},
    "model": {"name": "gemini-test"},
    "paths": {"output_data": "public/data.json"}
}

# Test extract_text_from_pdf
def test_extract_text_success():
    with patch("scripts.modules.cv_parser.PdfReader") as MockReader:
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Page text"
        MockReader.return_value.pages = [mock_page, mock_page]
        
        text = extract_text_from_pdf("dummy.pdf")
        assert text == "Page text\nPage text\n"

def test_extract_text_failure():
    with patch("scripts.modules.cv_parser.PdfReader", side_effect=Exception("Read error")):
        text = extract_text_from_pdf("dummy.pdf")
        assert text is None

# Test process_cv
@patch("scripts.modules.cv_parser.load_config", return_value=MOCK_CONFIG)
@patch("scripts.modules.cv_parser.get_ai_client")
@patch("scripts.modules.cv_parser.generate_content")
@patch("scripts.modules.cv_parser.extract_text_from_pdf")
@patch("glob.glob")
@patch("os.path.getmtime")
def test_process_cv_success(mock_mtime, mock_glob, mock_extract, mock_gen, mock_client, mock_config):
    # Setup mocks
    mock_glob.return_value = ["cv1.pdf", "cv2.pdf"]
    mock_mtime.side_effect = lambda x: 100 if "cv2" in x else 10
    mock_extract.return_value = "Raw CV Text"
    mock_gen.return_value = '{"profile": {"name": "Test"}}'
    
    mock_existing_data = {"profile": {}, "experience": []}
    
    # Use mock_open
    m = mock_open(read_data=json.dumps(mock_existing_data))
    with patch("builtins.open", m):
        result = process_cv(verbose=True)
        
        assert result is True
        mock_glob.assert_called()
        mock_extract.assert_called_with("cv2.pdf")
        mock_gen.assert_called()
        
        # Verify file write
        # We check the calls to write.
        # Since we read and write to the same file (conceptually), we need to check the last write call
        handle = m()
        handle.write.assert_called()
        
        # Inspect what was written
        # There might be multiple write calls if json.dump writes in chunks, but usually it writes once or a few times.
        # We can concatenate all write calls to check the full JSON.
        written_content = "".join(call.args[0] for call in handle.write.call_args_list)
        written_json = json.loads(written_content)
        assert written_json["profile"]["name"] == "Test"

@patch("scripts.modules.cv_parser.load_config", return_value=MOCK_CONFIG)
@patch("glob.glob", return_value=[])
def test_process_cv_no_files(mock_glob, mock_config):
    result = process_cv()
    assert result is False

@patch("scripts.modules.cv_parser.load_config", return_value=MOCK_CONFIG)
@patch("glob.glob", return_value=["cv.pdf"])
@patch("os.path.getmtime", return_value=12345) # Mock getmtime
@patch("scripts.modules.cv_parser.extract_text_from_pdf", return_value=None)
def test_process_cv_extract_fail(mock_extract, mock_mtime, mock_glob, mock_config):
    result = process_cv()
    assert result is False

@patch("scripts.modules.cv_parser.load_config", return_value=MOCK_CONFIG)
@patch("glob.glob", return_value=["cv.pdf"])
@patch("os.path.getmtime", return_value=12345) # Mock getmtime
@patch("scripts.modules.cv_parser.extract_text_from_pdf", return_value="text")
@patch("scripts.modules.cv_parser.get_ai_client", return_value=MagicMock())
@patch("scripts.modules.cv_parser.generate_content", return_value="INVALID JSON")
def test_process_cv_ai_json_error(mock_gen, mock_client, mock_extract, mock_mtime, mock_glob, mock_config):
    result = process_cv()
    assert result is False
