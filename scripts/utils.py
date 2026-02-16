import os
import yaml
from google.genai import Client

def load_config():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(base_path, "scripts", "config.yaml")
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def get_ai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment variables.")
        return None
    return Client(api_key=api_key)

def generate_content(client, model, system_instruction, user_content):
    if not client:
        return None
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=user_content,
            config={
                "system_instruction": system_instruction,
                "response_mime_type": "application/json"
            }
        )
        return response.text
    except Exception as e:
        print(f"Error generating content: {e}")
        return None
