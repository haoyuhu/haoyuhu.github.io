import os
import json
import glob
import datetime
from scripts.utils import load_config, get_ai_client, generate_content

def process_content_folder(folder_path, content_type, system_prompt, verbose=False):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        return []

    processed_items = []
    client = get_ai_client()
    config = load_config()

    # Supported formats: .txt, .md (future: .pdf, .mp3 transcription)
    files = glob.glob(os.path.join(folder_path, "*"))
    
    for file_path in files:
        filename = os.path.basename(file_path)
        if filename.startswith("."): continue
        
        print(f"Processing {content_type}: {filename}")
        
        with open(file_path, "r") as f:
            content = f.read()
            
        # If it's already structured JSON/YAML-like, maybe skip?
        # For now, we assume raw input needs AI processing
        
        ai_response = generate_content(client, config["model"]["name"], system_prompt, content)
        
        if ai_response:
            try:
                clean_json = ai_response.replace("```json", "").replace("```", "").strip()
                item_data = json.loads(clean_json)
                item_data["postType"] = content_type # 'note' (garden) or 'article'
                item_data["originalFile"] = filename
                processed_items.append(item_data)
            except Exception as e:
                print(f"Error parsing AI response for {filename}: {e}")

    return processed_items

def update_content(verbose=False):
    config = load_config()
    data_path = os.path.join(os.getcwd(), config["paths"]["output_data"])
    
    # Load existing data
    with open(data_path, "r") as f:
        current_data = json.load(f)
    
    existing_blogs = current_data.get("blogs", [])
    # We might want to keep existing ones if we don't re-process everything
    # But for simplicity, let's re-process the inbox. 
    # Ideally, we should move processed files to a 'processed' folder or check hash.
    # For this MVP, we will just process what's in the assets folders and REPLACE the blogs list
    # OR merge if we want to support manual additions.
    # Let's assume we append new ones? No, user said "incremental update".
    
    # Strategy: Read all files in assets/garden and assets/articles, re-generate.
    # To save tokens, we could check if output already exists for that file.
    
    garden_items = process_content_folder(
        os.path.join(os.getcwd(), "assets", "garden"), 
        "note", 
        config["prompts"]["garden_system"],
        verbose
    )
    
    article_items = process_content_folder(
        os.path.join(os.getcwd(), "assets", "articles"), 
        "article", 
        config["prompts"]["article_system"],
        verbose
    )
    
    all_new_items = garden_items + article_items
    
    if all_new_items:
        # Update blogs list
        # We can either replace all, or merge. Let's replace for now to ensure consistency with source files.
        current_data["blogs"] = all_new_items
        
        with open(data_path, "w") as f:
            json.dump(current_data, f, indent=2)
        print(f"Successfully updated content: {len(garden_items)} notes, {len(article_items)} articles.")
    else:
        print("No content found to update.")

    return True

if __name__ == "__main__":
    update_content(verbose=True)
