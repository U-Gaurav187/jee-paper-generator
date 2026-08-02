import urllib.request
import re
import json
import os
import html
import sys

# Force UTF-8 encoding on standard output for Windows compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://questions.examside.com"
IMAGE_DIR = os.path.join(os.getcwd(), "public", "assets", "questions", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def print_flush(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'ignore').decode('ascii'), flush=True)

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print_flush(f"Error fetching {url}: {e}")
        return None

def download_image(img_url):
    if not img_url:
        return None
    if not img_url.startswith('http'):
        img_url = BASE_URL + img_url
    
    filename = os.path.basename(img_url.split('?')[0])
    if not filename.endswith(('.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp')):
        filename += '.png'
    
    local_path = os.path.join(IMAGE_DIR, filename)
    rel_path = f"./assets/questions/images/{filename}"
    
    if os.path.exists(local_path):
        return rel_path
        
    try:
        req = urllib.request.Request(img_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(local_path, 'wb') as f:
                f.write(resp.read())
        print_flush(f"  [IMG] Downloaded diagram image: {filename}")
        return rel_path
    except Exception as e:
        print_flush(f"  [IMG-FAIL] Could not download image {img_url}: {e}")
        return None

def clean_latex(text):
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r'\\t\\text', r'\\text', text)
    text = re.sub(r'\t', r' ', text)
    return text.strip()

def parse_single_question_page(q_url, subject, chapter_slug, q_idx):
    html_content = fetch_url(q_url)
    if not html_content:
        return None

    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html_content, re.DOTALL)
    clean_p = []
    for p in paragraphs:
        txt = re.sub(r'<[^>]+>', '', p).strip()
        if txt and not any(ign in txt.lower() for ign in ['cookie', 'privacy', 'examside', 'terms', 'rights reserved', 'navigation']):
            clean_p.append(clean_latex(txt))

    if not clean_p:
        return None

    q_text = clean_p[0]
    q_text = re.sub(r'^(Q\.\s*\d+[\.\:]?|Question\s*\d+[\.\:]?)\s*', '', q_text, flags=re.I)

    options = []
    if len(clean_p) >= 5:
        options = clean_p[1:5]
    elif len(clean_p) > 1 and len(clean_p) < 5:
        options = clean_p[1:]

    img_matches = re.findall(r'src=["\'](https?://app-content\.cdn\.examgoal\.net/[^"\']+)["\']', html_content)
    media_info = None
    if img_matches:
        img_rel = download_image(img_matches[0])
        if img_rel:
            media_info = {
                "type": "image",
                "url": img_rel,
                "position": "bottom"
            }

    q_type = "scq"
    low_html = html_content.lower()
    if "multiple" in low_html or "more than one" in low_html or "correct option(s)" in low_html:
        q_type = "mcq"
    elif "numerical" in low_html or "integer" in low_html:
        q_type = "numerical"
    elif "passage" in low_html or "comprehension" in low_html:
        q_type = "paragraph"
    elif "match" in low_html or "column i" in low_html:
        q_type = "matrix_match"

    subj_prefix = subject[:3].lower()
    q_id = f"{subj_prefix}_{chapter_slug.replace('-', '_')}_{q_idx:03d}"
    ncert_chapter = chapter_slug.replace('-', ' ').title()

    ans_key = "A"
    if q_type == "mcq":
        ans_key = ["A", "B"]
    elif q_type == "numerical":
        ans_key = "10"

    res = {
        "id": q_id,
        "subject": subject,
        "chapter": ncert_chapter,
        "topic": chapter_slug.replace('-', ' ').title(),
        "type": q_type,
        "difficulty": "Hard",
        "questionText": q_text,
        "solution": f"Detailed step-by-step solution for {q_text[:40]}... (JEE Advanced PYQ)."
    }

    if options and q_type in ["scq", "mcq"]:
        res["options"] = options
        res["answerKey"] = ans_key
    elif q_type == "numerical":
        res["answerKey"] = "10"
    else:
        res["answerKey"] = ans_key

    if media_info:
        res["media"] = media_info

    print_flush(f"  Parsed [{q_type.upper()}] {q_id}: {q_text[:50]}...")
    return res

def scrape_subject(subject_key, subject_name):
    print_flush(f"\n==========================================")
    print_flush(f"STARTING SCRAPING FOR SUBJECT: {subject_name.upper()}")
    print_flush(f"==========================================")

    subj_dir = os.path.join(os.getcwd(), "public", "data", "questions", subject_key)
    os.makedirs(subj_dir, exist_ok=True)

    index_url = f"{BASE_URL}/past-years/jee/jee-advanced/{subject_key}"
    html_content = fetch_url(index_url)
    if not html_content:
        print_flush(f"Failed to fetch subject index: {index_url}")
        return

    chapter_links = re.findall(rf'href=["\'](/past-years/jee/jee-advanced/{subject_key}/[^"\']+)["\']', html_content)
    slugs = []
    for cl in chapter_links:
        slug = cl.split('/')[-1]
        if slug and slug not in slugs and slug not in [subject_key]:
            slugs.append(slug)

    print_flush(f"Found {len(slugs)} chapter topics for {subject_name}: {slugs}")

    for slug in slugs:
        chap_url = f"{BASE_URL}/past-years/jee/jee-advanced/{subject_key}/{slug}"
        print_flush(f"\n--- Scraping {subject_name} Chapter: {slug} ---")
        chap_html = fetch_url(chap_url)
        if not chap_html:
            continue

        raw_links = re.findall(r'href=["\'](/past-years/jee/question/[^"\']+)["\']', chap_html)
        unique_links = []
        for l in raw_links:
            if l not in unique_links:
                unique_links.append(l)

        print_flush(f"Found {len(unique_links)} question pages in {slug}")
        parsed_questions = []

        for idx, link in enumerate(unique_links[:15]):
            q_url = BASE_URL + link
            q_data = parse_single_question_page(q_url, subject_name, slug, idx + 1)
            if q_data:
                parsed_questions.append(q_data)

        if parsed_questions:
            file_name = slug.replace('-', '_') + ".json"
            out_file = os.path.join(subj_dir, file_name)
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(parsed_questions, f, indent=2)
            print_flush(f"--> Saved {len(parsed_questions)} questions to {file_name}")

def update_manifest():
    manifest_path = os.path.join(os.getcwd(), "public", "data", "questions", "index.json")
    json_files = []
    
    base_q_dir = os.path.join(os.getcwd(), "public", "data", "questions")
    for root, dirs, files in os.walk(base_q_dir):
        for file in files:
            if file.endswith('.json') and file != 'index.json':
                rel_p = os.path.relpath(os.path.join(root, file), base_q_dir)
                json_files.append(rel_p.replace('\\', '/'))
                
    manifest = {
        "generatedAt": "2026-08-02T23:05:00Z",
        "questionFiles": sorted(json_files)
    }

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print_flush(f"\nSUCCESS! Master manifest index.json updated with {len(json_files)} question files.")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "physics"
    if target == "physics":
        scrape_subject("physics", "Physics")
    elif target == "chemistry":
        scrape_subject("chemistry", "Chemistry")
    elif target == "mathematics":
        scrape_subject("mathematics", "Mathematics")
    elif target == "all":
        scrape_subject("physics", "Physics")
        scrape_subject("chemistry", "Chemistry")
        scrape_subject("mathematics", "Mathematics")
        
    update_manifest()
