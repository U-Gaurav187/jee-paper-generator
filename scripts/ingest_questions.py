import json
import os
import re
import sys
import urllib.request

"""
JEE Advanced Smart Web Scraping & Ingestion Engine (Python)
----------------------------------------------------------
Features:
1. Automatically maps web-scraped chapter names (e.g. "Ray Optics & Instruments")
   to standard NCERT / JEE Advanced Chapter names.
2. Automatically downloads scraped image files (PNG/WebP/JPG) into
   public/assets/questions/images/ and links relative path in question JSON.
3. Automatically creates modular JSON files in public/data/questions/<subject>/<chapter_slug>.json
4. Automatically updates public/data/questions/index.json manifest.
"""

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "questions")
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "questions", "images")

# NCERT / JEE Advanced Chapter Normalization Mapping
NCERT_MAP = {
    # Physics
    "electric charges and fields": "Electrostatics",
    "electrostatic potential and capacitance": "Electrostatics",
    "electrostatics": "Electrostatics",
    "current electricity": "Current Electricity",
    "moving charges and magnetism": "Magnetism & EMI",
    "magnetism and matter": "Magnetism & EMI",
    "electromagnetic induction": "Magnetism & EMI",
    "alternating current": "Magnetism & EMI",
    "ray optics and optical instruments": "Optics",
    "wave optics": "Optics",
    "optics": "Optics",
    "dual nature of radiation and matter": "Modern Physics",
    "atoms": "Modern Physics",
    "nuclei": "Modern Physics",
    "semiconductors": "Modern Physics",
    "laws of motion": "Mechanics",
    "work energy and power": "Mechanics",
    "system of particles and rotational motion": "Rotational Dynamics",
    "rotational motion": "Rotational Dynamics",
    "gravitation": "Mechanics",
    "thermodynamics": "Thermodynamics & Kinetic Theory",
    "kinetic theory": "Thermodynamics & Kinetic Theory",

    # Chemistry
    "some basic concepts of chemistry": "Stoichiometry & Mole Concept",
    "structure of atom": "Atomic Structure",
    "classification of elements": "Periodic Table & Periodicity",
    "chemical bonding and molecular structure": "Chemical Bonding",
    "chemical thermodynamics": "Thermodynamics & Energetics",
    "equilibrium": "Chemical & Ionic Equilibrium",
    "redox reactions": "Electrochemistry & Redox",
    "solutions": "Solutions & Colligative Properties",
    "electrochemistry": "Electrochemistry & Redox",
    "chemical kinetics": "Chemical Kinetics",
    "d and f block elements": "Coordination & Transition Elements",
    "coordination compounds": "Coordination & Transition Elements",
    "haloalkanes and haloarenes": "Organic Chemistry - Reaction Mechanisms",
    "alcohols phenols and ethers": "Organic Chemistry - Oxygen Compounds",
    "aldehydes ketones and carboxylic acids": "Organic Chemistry - Carbonyl Compounds",
    "amines": "Organic Chemistry - Nitrogen Compounds",
    "biomolecules": "Biomolecules & Polymers",

    # Mathematics
    "relations and functions": "Sets, Relations & Functions",
    "inverse trigonometric functions": "Trigonometry",
    "matrices": "Matrices & Determinants",
    "determinants": "Matrices & Determinants",
    "continuity and differentiability": "Calculus",
    "application of derivatives": "Calculus",
    "integrals": "Calculus",
    "application of integrals": "Calculus",
    "differential equations": "Calculus",
    "vector algebra": "Vectors & 3D Geometry",
    "three dimensional geometry": "Vectors & 3D Geometry",
    "probability": "Probability",
    "complex numbers and quadratic equations": "Complex Numbers & Quadratics",
    "permutations and combinations": "Combinatorics & Binomial Theorem",
    "sequences and series": "Sequences & Series"
}

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')

def normalize_chapter_name(raw_name):
    cleaned = re.sub(r'[^a-zA-Z0-9 ]', '', raw_name.lower()).strip()
    for pattern, ncert_name in NCERT_MAP.items():
        if pattern in cleaned or cleaned in pattern:
            return ncert_name
    return raw_name.title()

def download_image_if_remote(image_url, q_id):
    """
    Downloads remote image URLs (http/https) during web scraping into public/assets/questions/images/
    Returns relative path for JSON.
    """
    if not image_url or not (image_url.startswith("http://") or image_url.startswith("https://")):
        return image_url

    os.makedirs(IMAGE_DIR, exist_ok=True)
    ext = os.path.splitext(image_url.split("?")[0])[1]
    if not ext or len(ext) > 5:
        ext = ".png"

    filename = f"{q_id}_img{ext}"
    local_file_path = os.path.join(IMAGE_DIR, filename)
    rel_json_path = f"assets/questions/images/{filename}"

    try:
        urllib.request.urlretrieve(image_url, local_file_path)
        print(f"   Downloaded image for {q_id} -> {rel_json_path}")
        return rel_json_path
    except Exception as e:
        print(f"   Warning: Could not download image {image_url}: {e}")
        return image_url

def ingest_scraped_questions(raw_questions):
    grouped = {}

    for q in raw_questions:
        subject = q.get("subject", "Physics").capitalize()
        if subject not in ["Physics", "Chemistry", "Mathematics", "Computer Science"]:
            subject = "Physics"

        raw_chapter = q.get("chapter", "General")
        norm_chapter = normalize_chapter_name(raw_chapter)
        q["chapter"] = norm_chapter

        # Process & Download remote scraped images if present
        if "media" in q and isinstance(q["media"], dict):
            if q["media"].get("type") == "image" and "url" in q["media"]:
                q["media"]["url"] = download_image_if_remote(q["media"]["url"], q["id"])

        sub_dir = subject.lower().replace(" ", "_")
        chap_file = f"{slugify(norm_chapter)}.json"
        rel_path = f"{sub_dir}/{chap_file}"

        if rel_path not in grouped:
            grouped[rel_path] = []
        grouped[rel_path].append(q)

    # Save each modular JSON file
    for rel_path, q_list in grouped.items():
        full_path = os.path.join(DATA_DIR, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        existing = []
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                try:
                    existing = json.load(f)
                except Exception:
                    existing = []

        existing_ids = {item["id"] for item in existing if "id" in item}
        for new_q in q_list:
            if new_q["id"] not in existing_ids:
                existing.append(new_q)

        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(q_list)} questions to {rel_path}")

    # Re-build master index.json manifest automatically
    all_files = []
    for root, _, files in os.walk(DATA_DIR):
        for f in files:
            if f.endswith(".json") and f != "index.json":
                rel = os.path.relpath(os.path.join(root, f), DATA_DIR).replace("\\", "/")
                all_files.append(rel)

    all_files.sort()
    index_path = os.path.join(DATA_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(all_files, f, indent=2)
    print(f"\nManifest index.json updated with {len(all_files)} total topic modules!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
        ingest_scraped_questions(data)
    else:
        print("JEE Advanced Smart Web Scraping Ingestor")
        print("Usage: python scripts/ingest_questions.py <path_to_scraped_questions.json>")
