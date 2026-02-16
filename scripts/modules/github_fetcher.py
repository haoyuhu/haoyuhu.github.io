import os
import json
from github import Github
from scripts.utils import load_config

def fetch_github_data(verbose=False):
    config = load_config()
    username = config.get("github_username", "haoyuhu")
    token = os.environ.get("GITHUB_TOKEN")
    
    try:
        if not token:
            print("Warning: GITHUB_TOKEN not found. Using unauthenticated requests (rate limited).")
            g = Github()
        else:
            g = Github(token)

        user = g.get_user(username)
        print(f"Fetching repositories for user: {username}")
        
        repos_data = []
        # Get public repos
        for repo in user.get_repos(type="owner", sort="updated", direction="desc"):
            if repo.fork:
                continue
            
            repo_info = {
                "name": repo.name,
                "description": repo.description,
                "language": repo.language,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "url": repo.html_url,
                "homepage": repo.homepage,
                "topics": repo.get_topics(),
                "updated_at": repo.updated_at.isoformat()
            }
            repos_data.append(repo_info)
            if verbose:
                print(f"  - {repo.name} ({repo.stargazers_count} stars)")

        # Limit to top 20 or so if needed, but for now we keep all non-forks
        
        # Load existing data
        data_path = os.path.join(os.getcwd(), config["paths"]["output_data"])
        with open(data_path, "r") as f:
            current_data = json.load(f)

        current_data["repos"] = repos_data

        with open(data_path, "w") as f:
            json.dump(current_data, f, indent=2)
            
        print(f"Successfully updated {len(repos_data)} repositories.")
        return True

    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
        return False

if __name__ == "__main__":
    fetch_github_data(verbose=True)
