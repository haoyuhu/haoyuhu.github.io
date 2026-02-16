import os
import json
import glob
from pypdf import PdfReader
from scripts.utils import load_config, get_ai_client, generate_content

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return None

def process_cv(verbose=False):
    config = load_config()
    cv_dir = os.path.join(os.getcwd(), "assets", "cv")
    
    # Find the latest PDF
    pdf_files = glob.glob(os.path.join(cv_dir, "*.pdf"))
    if not pdf_files:
        print("No PDF files found in assets/cv/")
        return False

    latest_pdf = max(pdf_files, key=os.path.getmtime)
    print(f"Processing CV: {latest_pdf}")

    text_content = extract_text_from_pdf(latest_pdf)
    if not text_content:
        return False

    client = get_ai_client()
    if not client:
        return False

    print("Sending content to AI for parsing...")
    system_prompt = config["prompts"]["cv_system"]
    
    # Using the generate_content utility which returns raw text
    # We expect the model to return JSON
    response_text = generate_content(client, config["model"]["name"], system_prompt, text_content)
    
    if not response_text:
        return False

    try:
        # Clean up markdown code blocks if present
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        cv_data = json.loads(clean_json)
        
        # Load existing data
        data_path = os.path.join(os.getcwd(), config["paths"]["output_data"])
        with open(data_path, "r") as f:
            current_data = json.load(f)

        # Merge data (Overwrite profile, experience, education, skills)
        current_data["profile"] = cv_data.get("profile", current_data.get("profile"))
        current_data["experience"] = cv_data.get("experience", current_data.get("experience"))
        current_data["education"] = cv_data.get("education", current_data.get("education"))
        current_data["skills"] = cv_data.get("skills", current_data.get("skills"))

        with open(data_path, "w") as f:
            json.dump(current_data, f, indent=2)
            
        print("Successfully updated CV data.")
        return True

    except json.JSONDecodeError as e:
        print(f"Failed to parse AI response as JSON: {e}")
        if verbose:
            print(response_text)
        return False
    except Exception as e:
        print(f"Error updating data: {e}")
        return False

if __name__ == "__main__":
    process_cv(verbose=True)
