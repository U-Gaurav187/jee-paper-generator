"""
==============================================================================
COMPREHENSIVE JEE ADVANCED QUESTION SCRAPER - ALL CHAPTERS
==============================================================================
High-precision extraction engine using SvelteKit payload parsing.
Scrapes all Physics, Chemistry, and Mathematics chapters from ExamSIDE.

Features:
- Direct SvelteKit hydration payload extraction (no HTML parsing)
- Clean LaTeX text with all HTML tags stripped
- Image downloading for diagrams
- Rate-limited requests to avoid bans
- Resume support (skips already-scraped chapters)
- Generates index.json manifest
==============================================================================
"""
import urllib.request
import re
import json
import os
import html
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ========================= CONFIGURATION =========================

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

BASE_URL = "https://questions.examside.com"

# Rate limiting: seconds between requests
REQUEST_DELAY = 0.5  # 500ms between question page fetches
CHAPTER_DELAY = 2.0  # 2s between chapter fetches

IMAGE_DIR = os.path.join(os.getcwd(), "public", "assets", "questions", "images")
DATA_DIR = os.path.join(os.getcwd(), "public", "data", "questions")
os.makedirs(IMAGE_DIR, exist_ok=True)

# ========================= CHAPTER DEFINITIONS =========================
# Format: (slug, display_name, json_filename)

PHYSICS_CHAPTERS = [
    ("units-and-measurements", "Units & Measurements", "units_and_measurements"),
    ("motion", "Motion", "motion"),
    ("laws-of-motion", "Laws of Motion", "laws_of_motion"),
    ("work-power-and-energy", "Work Power & Energy", "work_power_and_energy"),
    ("center-of-mass-momentum-and-collision", "Center of Mass & Collision", "center_of_mass"),
    ("rotational-motion", "Rotational Motion", "rotational_motion"),
    ("gravitation", "Gravitation", "gravitation"),
    ("properties-of-matter", "Properties of Matter", "properties_of_matter"),
    ("heat-and-thermodynamics", "Heat & Thermodynamics", "heat_and_thermodynamics"),
    ("simple-harmonic-motion", "Simple Harmonic Motion", "simple_harmonic_motion"),
    ("wave-motion", "Wave Motion", "wave_motion"),
    ("electrostatics", "Electrostatics", "electrostatics"),
    ("current-electricity", "Current Electricity", "current_electricity"),
    ("capacitance", "Capacitance", "capacitance"),
    ("magnetic-effect-of-current-and-magnetism", "Magnetic Effect of Current", "magnetic_effect"),
    ("electromagnetic-induction-and-alternating-current", "Electromagnetic Induction & AC", "electromagnetic_induction"),
    ("electromagnetic-waves", "Electromagnetic Waves", "electromagnetic_waves"),
    ("geometrical-optics", "Geometrical Optics", "geometrical_optics"),
    ("wave-optics", "Wave Optics", "wave_optics"),
    ("practical-physics", "Practical Physics", "practical_physics"),
    ("atoms-and-nuclei", "Atoms & Nuclei", "atoms_and_nuclei"),
    ("dual-nature-of-radiation", "Dual Nature of Radiation", "dual_nature_of_radiation"),
    ("semiconductors-and-communication-system", "Semiconductors", "semiconductors"),
    ("fluid-mechanics", "Fluid Mechanics", "fluid_mechanics"),
]

CHEMISTRY_CHAPTERS = [
    ("some-basic-concepts-of-chemistry", "Some Basic Concepts of Chemistry", "basic_concepts"),
    ("structure-of-atom", "Structure of Atom", "structure_of_atom"),
    ("redox-reactions", "Redox Reactions", "redox_reactions"),
    ("gaseous-state", "Gaseous State", "gaseous_state"),
    ("chemical-equilibrium", "Chemical Equilibrium", "chemical_equilibrium"),
    ("ionic-equilibrium", "Ionic Equilibrium", "ionic_equilibrium"),
    ("solutions", "Solutions", "solutions"),
    ("thermodynamics", "Thermodynamics", "thermodynamics"),
    ("chemical-kinetics-and-nuclear-chemistry", "Chemical Kinetics & Nuclear Chemistry", "chemical_kinetics"),
    ("electrochemistry", "Electrochemistry", "electrochemistry"),
    ("solid-state", "Solid State", "solid_state"),
    ("surface-chemistry", "Surface Chemistry", "surface_chemistry"),
    ("periodic-table-and-periodicity", "Periodic Table & Periodicity", "periodic_table"),
    ("chemical-bonding-and-molecular-structure", "Chemical Bonding", "chemical_bonding"),
    ("isolation-of-elements", "Isolation of Elements", "isolation_of_elements"),
    ("hydrogen", "Hydrogen", "hydrogen"),
    ("s-block-elements", "s-Block Elements", "s_block_elements"),
    ("p-block-elements", "p-Block Elements", "p_block_elements"),
    ("d-and-f-block-elements", "d & f Block Elements", "d_f_block_elements"),
    ("coordination-compounds", "Coordination Compounds", "coordination_compounds"),
    ("salt-analysis", "Salt Analysis", "salt_analysis"),
    ("basics-of-organic-chemistry", "Basics of Organic Chemistry", "basics_organic_chemistry"),
    ("hydrocarbons", "Hydrocarbons", "hydrocarbons"),
    ("haloalkanes-and-haloarenes", "Haloalkanes & Haloarenes", "haloalkanes"),
    ("alcohols-phenols-and-ethers", "Alcohols Phenols & Ethers", "alcohols_phenols_ethers"),
    ("aldehydes-ketones-and-carboxylic-acids", "Aldehydes Ketones & Carboxylic Acids", "aldehydes_ketones"),
    ("compounds-containing-nitrogen", "Compounds Containing Nitrogen", "nitrogen_compounds"),
    ("polymers", "Polymers", "polymers"),
    ("biomolecules", "Biomolecules", "biomolecules"),
    ("chemistry-in-everyday-life", "Chemistry in Everyday Life", "chemistry_everyday_life"),
    ("practical-organic-chemistry", "Practical Organic Chemistry", "practical_organic_chemistry"),
]

MATHEMATICS_CHAPTERS = [
    ("quadratic-equation-and-inequalities", "Quadratic Equations & Inequalities", "quadratic_equations"),
    ("sequences-and-series", "Sequences & Series", "sequences_and_series"),
    ("mathematical-induction-and-binomial-theorem", "Mathematical Induction & Binomial Theorem", "binomial_theorem"),
    ("matrices-and-determinants", "Matrices & Determinants", "matrices_determinants"),
    ("permutations-and-combinations", "Permutations & Combinations", "permutations_combinations"),
    ("probability", "Probability", "probability"),
    ("vector-algebra", "Vector Algebra", "vector_algebra"),
    ("3d-geometry", "3D Geometry", "three_d_geometry"),
    ("statistics", "Statistics", "statistics"),
    ("complex-numbers", "Complex Numbers", "complex_numbers"),
    ("trigonometric-functions-and-equations", "Trigonometric Functions & Equations", "trigonometric_functions"),
    ("inverse-trigonometric-functions", "Inverse Trigonometric Functions", "inverse_trigonometry"),
    ("properties-of-triangle", "Properties of Triangle", "properties_of_triangle"),
    ("straight-lines-and-pair-of-straight-lines", "Straight Lines", "straight_lines"),
    ("circle", "Circle", "circle"),
    ("parabola", "Parabola", "parabola"),
    ("ellipse", "Ellipse", "ellipse"),
    ("hyperbola", "Hyperbola", "hyperbola"),
    ("functions", "Functions", "functions"),
    ("limits-continuity-and-differentiability", "Limits Continuity & Differentiability", "limits_continuity"),
    ("differentiation", "Differentiation", "differentiation"),
    ("application-of-derivatives", "Application of Derivatives", "application_of_derivatives"),
    ("indefinite-integrals", "Indefinite Integrals", "indefinite_integrals"),
    ("definite-integration", "Definite Integration", "definite_integration"),
    ("application-of-integration", "Application of Integration", "application_of_integration"),
    ("differential-equations", "Differential Equations", "differential_equations"),
]

ALL_SUBJECTS = {
    "physics": PHYSICS_CHAPTERS,
    "chemistry": CHEMISTRY_CHAPTERS,
    "mathematics": MATHEMATICS_CHAPTERS,
}

# ========================= CORE FUNCTIONS =========================

def download_image(img_url):
    """Download image and return relative path."""
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
        return rel_path
    except Exception as e:
        return None


def clean_text(raw_text):
    """Convert HTML-laden text into clean LaTeX-ready text."""
    if not raw_text:
        return ""
    # Decode unicode escapes
    txt = raw_text.replace('\\u003C', '<').replace('\\u003c', '<').replace('\\u003E', '>').replace('\\u003e', '>')
    txt = txt.replace('\\"', '"').replace("\\'", "'").replace('\\\\', '\\')
    txt = html.unescape(txt)

    # Convert literal \n to real newlines
    txt = txt.replace('\\n', '\n')

    # Convert HTML sub/sup to LaTeX inline math
    def sub_to_latex(m):
        inner = m.group(1)
        # If already inside $$ delimiters, use raw _{...}
        return f'$_{{{inner}}}$'
    def sup_to_latex(m):
        inner = m.group(1)
        return f'$^{{{inner}}}$'

    txt = re.sub(r'<sub>(.*?)</sub>', sub_to_latex, txt, flags=re.DOTALL)
    txt = re.sub(r'<sup>(.*?)</sup>', sup_to_latex, txt, flags=re.DOTALL)

    # Convert <b>X</b> to **X**
    txt = re.sub(r'<b>(.*?)</b>', r'**\1**', txt, flags=re.DOTALL)
    txt = re.sub(r'<i>(.*?)</i>', r'*\1*', txt, flags=re.DOTALL)

    # Convert <br> to newline
    txt = re.sub(r'<br\s*/?>', '\n', txt)

    # Convert <img> to [Diagram] placeholder
    txt = re.sub(r'<img[^>]+>', '\n[Diagram]\n', txt)

    # Strip ALL remaining HTML tags
    txt = re.sub(r'</?[a-zA-Z][^>]*>', '', txt)

    # Fix adjacent inline math: $...$$ ... $$ should not have double-dollar merges
    # Clean up $$ $$ that wraps nothing
    txt = re.sub(r'\$\$\s*\$\$', '', txt)

    # Clean up excessive whitespace
    txt = re.sub(r'\n{3,}', '\n\n', txt)
    txt = re.sub(r'[ \t]+', ' ', txt)

    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in txt.split('\n')]
    txt = '\n'.join(lines)

    return txt.strip()


def parse_question_page(url, subject, chapter_name, json_prefix, q_idx):
    """Parse a single question page and return a question object."""
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_content = resp.read().decode('utf-8')
    except Exception as e:
        return None

    # Isolate English question payload block
    pos = html_content.find("question:{en:")
    if pos == -1:
        return None

    # Slice up to hi:{ or section end
    block = html_content[pos : pos + 12000]
    hi_pos = block.find(",hi:{")
    if hi_pos != -1:
        en_block = block[:hi_pos]
    else:
        en_block = block

    # Question Text
    content_m = re.search(r'content:"((?:[^"\\]|\\.)*)"', en_block)
    if not content_m:
        content_m = re.search(r"content:'((?:[^'\\]|\\.)*)'", en_block)
    if not content_m:
        return None
    
    raw_content = content_m.group(1)
    q_text = clean_text(raw_content)

    if not q_text or len(q_text) < 5:
        return None

    # Diagram Image check
    media_info = None
    img_urls = re.findall(r'https?://app-content\.cdn\.examgoal\.net/[^"\'\s>]+', raw_content)
    if not img_urls:
        img_urls = re.findall(r'https?://app-content\.cdn\.examgoal\.net/[^"\'\s>]+', en_block)
    if img_urls:
        img_rel = download_image(img_urls[0])
        if img_rel:
            media_info = {"type": "image", "url": img_rel, "position": "bottom"}

    # Options (Strictly from English block)
    options = []
    opt_matches = re.findall(r'\{identifier:["\']([A-D])["\']\s*,\s*content:["\']((?:[^"\\]|\\.)*)["\']', en_block)
    seen_idents = set()
    for ident, opt_raw in opt_matches:
        if ident not in seen_idents:
            seen_idents.add(ident)
            options.append(clean_text(opt_raw))

    # Correct Options
    corr_m = re.search(r'correct_options:\[(.*?)\]', en_block)
    correct_opts = []
    if corr_m:
        correct_opts = re.findall(r'["\']([A-D])["\']', corr_m.group(1))

    # Numerical Answer
    ans_m = re.search(r'answer:(?:["\']([^"\']+)["\']|([\d\.]+))', en_block)
    ans_val = ""
    if ans_m:
        ans_val = ans_m.group(1) or ans_m.group(2) or ""

    # Question Type
    type_m = re.search(r'type:["\']([^"\']+)["\']', html_content)
    raw_type = type_m.group(1) if type_m else "scq"
    
    q_type = "scq"
    if raw_type in ["mcq", "mcqm"]:
        q_type = "mcq" if len(correct_opts) > 1 else "scq"
    elif raw_type in ["integer", "numerical"]:
        q_type = "numerical"
    elif raw_type in ["paragraph", "comprehension"]:
        q_type = "paragraph"
    elif raw_type in ["matrix", "match"]:
        q_type = "matrix_match"

    # Answer Key
    if q_type in ["scq", "mcq"]:
        answer_key = correct_opts if correct_opts else ["A"]
    elif q_type == "numerical":
        answer_key = ans_val if ans_val else "0"
    else:
        answer_key = correct_opts if correct_opts else ["A"]

    # Solution
    exp_m = re.search(r'explanation:["\']((?:[^"\\]|\\.)*)["\']', block)
    solution = clean_text(exp_m.group(1)) if exp_m else ""
    if not solution:
        solution = f"Solution for this {chapter_name} question (JEE Advanced PYQ)."

    item = {
        "id": f"{json_prefix}_{q_idx:03d}",
        "subject": subject.capitalize(),
        "chapter": chapter_name,
        "topic": chapter_name,
        "type": q_type,
        "difficulty": "Hard",
        "questionText": q_text,
        "solution": solution,
        "answerKey": answer_key
    }

    if options and q_type in ["scq", "mcq", "matrix_match"]:
        item["options"] = options
    if media_info:
        item["media"] = media_info

    return item


def scrape_chapter(subject, slug, chapter_name, json_filename):
    """Scrape all questions for a single chapter."""
    chapter_url = f"{BASE_URL}/past-years/jee/jee-advanced/{subject}/{slug}"
    
    try:
        req = urllib.request.Request(chapter_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_content = resp.read().decode('utf-8')
    except Exception as e:
        print(f"    ERROR fetching chapter page: {e}")
        return []

    q_links = re.findall(r'href=["\'](/past-years/jee/question/[^"\']+)["\']', html_content)
    unique_links = list(dict.fromkeys(q_links))
    
    if not unique_links:
        print(f"    No questions found on chapter page.")
        return []
    
    print(f"    Found {len(unique_links)} question links.")

    subj_abbr = {"physics": "phy", "chemistry": "chem", "mathematics": "math"}
    prefix = f"{subj_abbr.get(subject, subject)}_{json_filename}"

    questions = []
    for idx, link in enumerate(unique_links):
        url = BASE_URL + link
        q_item = parse_question_page(url, subject, chapter_name, prefix, idx + 1)
        if q_item:
            questions.append(q_item)
        
        # Progress indicator every 10 questions
        if (idx + 1) % 10 == 0:
            print(f"      [{idx+1}/{len(unique_links)}] scraped...", flush=True)
        
        time.sleep(REQUEST_DELAY)

    print(f"    => Extracted {len(questions)} questions successfully.")
    return questions


def main():
    print("=" * 70)
    print("  JEE ADVANCED COMPREHENSIVE QUESTION SCRAPER")
    print("  High-Precision SvelteKit Payload Extraction Engine")
    print("=" * 70)

    all_files = []  # For index.json
    total_questions = 0
    stats = {}

    for subject, chapters in ALL_SUBJECTS.items():
        subj_dir = os.path.join(DATA_DIR, subject)
        os.makedirs(subj_dir, exist_ok=True)
        
        print(f"\n{'━' * 60}")
        print(f"  SUBJECT: {subject.upper()} ({len(chapters)} chapters)")
        print(f"{'━' * 60}")
        
        subj_total = 0

        for ch_idx, (slug, chapter_name, json_filename) in enumerate(chapters):
            out_file = os.path.join(subj_dir, f"{json_filename}.json")
            rel_path = f"{subject}/{json_filename}.json"
            
            # Check if already scraped (resume support)
            if os.path.exists(out_file):
                try:
                    with open(out_file, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                    if len(existing) > 0:
                        print(f"\n  [{ch_idx+1}/{len(chapters)}] {chapter_name}: SKIPPING (already {len(existing)} Qs)")
                        all_files.append(rel_path)
                        subj_total += len(existing)
                        total_questions += len(existing)
                        continue
                except:
                    pass
            
            print(f"\n  [{ch_idx+1}/{len(chapters)}] {chapter_name}")
            print(f"    URL: {BASE_URL}/past-years/jee/jee-advanced/{subject}/{slug}")
            
            questions = scrape_chapter(subject, slug, chapter_name, json_filename)
            
            if questions:
                with open(out_file, "w", encoding="utf-8") as f:
                    json.dump(questions, f, indent=2, ensure_ascii=False)
                all_files.append(rel_path)
                subj_total += len(questions)
                total_questions += len(questions)
            
            time.sleep(CHAPTER_DELAY)
        
        stats[subject] = subj_total
        print(f"\n  {subject.upper()} COMPLETE: {subj_total} questions total.")

    # Generate index.json
    index_data = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "questionFiles": sorted(all_files)
    }
    index_file = os.path.join(DATA_DIR, "index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=2)

    print(f"\n{'═' * 70}")
    print(f"  SCRAPING COMPLETE!")
    print(f"{'═' * 70}")
    print(f"  Physics:      {stats.get('physics', 0)} questions")
    print(f"  Chemistry:    {stats.get('chemistry', 0)} questions")
    print(f"  Mathematics:  {stats.get('mathematics', 0)} questions")
    print(f"  ─────────────────────────────")
    print(f"  TOTAL:        {total_questions} questions")
    print(f"  Files:        {len(all_files)} chapter JSONs")
    print(f"  Index:        {index_file}")
    print(f"{'═' * 70}")


if __name__ == "__main__":
    main()
