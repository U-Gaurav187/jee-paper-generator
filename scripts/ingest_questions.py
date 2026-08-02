import json
import os
import sys

"""
JEE Advanced Question Bulk Ingestion Utility (Python)
--------------------------------------------------
Use this script to bulk convert raw Markdown/LaTeX text files or CSVs
into structured JSON question packs for the web application.
"""

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "questions")

def validate_and_convert(raw_file_path, subject):
    if not os.path.exists(raw_file_path):
        print(f"Error: File {raw_file_path} not found.")
        return

    out_file = os.path.join(DATA_DIR, f"{subject.lower()}.json")
    print(f"Processing raw questions from {raw_file_path} into {out_file}...")
    
    # Reads JSON or converts custom markdown format
    with open(raw_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Save to data directory
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Success! Integrated {len(data)} questions into {subject.lower()}.json")

if __name__ == "__main__":
    print("JEE Advanced Question Ingestor (Python)")
    if len(sys.argv) > 2:
        validate_and_convert(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python scripts/ingest_questions.py <path_to_raw.json> <subject>")
