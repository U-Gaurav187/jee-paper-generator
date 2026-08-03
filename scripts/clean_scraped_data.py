"""
Post-process the scraped units_and_measurements.json to strip all raw HTML tags,
convert <sub>/<sup>/<b>/<br> to proper LaTeX, and clean up \\n literals.
"""
import re
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def html_to_clean_text(raw):
    """Convert HTML-laden question/solution text into clean LaTeX-ready text."""
    if not raw:
        return ""
    txt = raw

    # 1. Convert literal \\n to real newlines
    txt = txt.replace('\\n', '\n')

    # 2. Convert <sub>X</sub> to _{X} for LaTeX subscripts
    txt = re.sub(r'<sub>(.*?)</sub>', r'_{\1}', txt, flags=re.DOTALL)

    # 3. Convert <sup>X</sup> to ^{X} for LaTeX superscripts
    txt = re.sub(r'<sup>(.*?)</sup>', r'^{\1}', txt, flags=re.DOTALL)

    # 4. Convert <b>X</b> to **X** for bold
    txt = re.sub(r'<b>(.*?)</b>', r'**\1**', txt, flags=re.DOTALL)

    # 5. Convert <br> / <br/> to newline
    txt = re.sub(r'<br\s*/?>', '\n', txt)

    # 6. Convert <img ...src="URL"...> to [Image: URL]
    def img_replace(m):
        src = re.search(r'src="([^"]+)"', m.group(0))
        if src:
            return f'\n[Diagram]\n'
        return ''
    txt = re.sub(r'<img[^>]+>', img_replace, txt)

    # 7. Strip all remaining HTML tags (<p>, </p>, <div>, <span>, etc.)
    txt = re.sub(r'</?[a-zA-Z][^>]*>', '', txt)

    # 8. Clean up excessive whitespace / newlines
    txt = re.sub(r'\n{3,}', '\n\n', txt)
    txt = re.sub(r'[ \t]+', ' ', txt)

    # 9. Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in txt.split('\n')]
    txt = '\n'.join(lines)

    return txt.strip()

def main():
    json_path = os.path.join(os.getcwd(), "public", "data", "questions", "physics", "units_and_measurements.json")

    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} questions. Cleaning...")

    cleaned = 0
    for q in questions:
        orig_q = q.get("questionText", "")
        orig_s = q.get("solution", "")

        q["questionText"] = html_to_clean_text(orig_q)
        q["solution"] = html_to_clean_text(orig_s)

        # Clean options too
        if "options" in q:
            q["options"] = [html_to_clean_text(opt) for opt in q["options"]]

        if q["questionText"] != orig_q or q["solution"] != orig_s:
            cleaned += 1

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    print(f"Cleaned {cleaned} questions. Saved to {json_path}")

    # Print sample to verify
    print("\n--- SAMPLE QUESTION 1 ---")
    print(f"Q: {questions[0]['questionText'][:300]}")
    print(f"\nS: {questions[0]['solution'][:300]}")

    print("\n--- SAMPLE QUESTION 3 ---")
    print(f"Q: {questions[2]['questionText'][:300]}")
    print(f"\nOpts: {questions[2].get('options', [])}")
    print(f"\nS: {questions[2]['solution'][:300]}")

if __name__ == "__main__":
    main()
