import argparse
import sys
import os
import questionary

# Ensure root directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.modules.cv_parser import process_cv
from scripts.modules.github_fetcher import fetch_github_data
from scripts.modules.content_processor import update_content

def main():
    parser = argparse.ArgumentParser(description="Haoyu Portfolio Automation Orchestrator")
    
    parser.add_argument('--all', action='store_true', help='Update all modules')
    parser.add_argument('--cv', action='store_true', help='Update CV from PDF')
    parser.add_argument('--projects', action='store_true', help='Sync GitHub Projects')
    parser.add_argument('--content', action='store_true', help='Process Garden/Articles')
    parser.add_argument('-v', '--verbose', action='store_true', help='Detailed logging')

    args = parser.parse_args()

    # If no args, run interactive mode
    if len(sys.argv) == 1:
        choices = questionary.checkbox(
            "Select modules to update:",
            choices=[
                "CV (Parse PDF)",
                "Projects (GitHub Sync)",
                "Content (Garden & Articles)"
            ]
        ).ask()
        
        if not choices:
            print("No modules selected. Exiting.")
            return

        if "CV (Parse PDF)" in choices:
            args.cv = True
        if "Projects (GitHub Sync)" in choices:
            args.projects = True
        if "Content (Garden & Articles)" in choices:
            args.content = True

    if args.all or args.cv:
        print("\n>>> [CV MODULE] Processing...")
        process_cv(args.verbose)
    
    if args.all or args.projects:
        print("\n>>> [PROJECTS MODULE] Syncing...")
        fetch_github_data(args.verbose)

    if args.all or args.content:
        print("\n>>> [CONTENT MODULE] Processing...")
        update_content(args.verbose)
    
    print("\n✨ All tasks completed successfully.")

if __name__ == "__main__":
    main()
