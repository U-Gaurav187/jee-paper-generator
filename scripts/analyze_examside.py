"""
Extract the raw SvelteKit data payload and parse the JavaScript object.
Also extract the question content from the actual HTML DOM structure.
"""
import urllib.request
import re
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = "https://questions.examside.com/past-years/jee/question/ptwo-charges-q1--q-and-q2--mq-are-placed-at-the-po-jee-advanced-physics-6hcyvamjdo9dperl"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

# The page has class "question-component" - let's extract the question component HTML
print("=== Strategy: Extract from question-component div ===")

# Find the main question component
qc_match = re.search(r'<div[^>]*class="[^"]*question-component[^"]*"[^>]*>(.*)', html, re.DOTALL)
if qc_match:
    qc_html = qc_match.group(1)[:50000]  # first 50K chars of question component
    
    # Find question text div
    q_text_match = re.search(r'<div[^>]*class="[^"]*grow question[^"]*"[^>]*>(.*?)</div>\s*</div>', qc_html, re.DOTALL)
    if q_text_match:
        q_html = q_text_match.group(1)
        print(f"\nQuestion HTML (first 1000 chars):")
        print(q_html[:1000])
    else:
        # Try question xl:text-lg
        q_text_match2 = re.search(r'<div[^>]*class="[^"]*question xl:text-lg[^"]*"[^>]*>(.*?)</div>', qc_html, re.DOTALL)
        if q_text_match2:
            print(f"\nQuestion text (first 1000 chars):")
            print(q_text_match2.group(1)[:1000])

    # Find options - look for option labels A, B, C, D
    # Options usually have a structure like <div class="option...">
    option_matches = re.findall(r'<div[^>]*class="[^"]*option[^"]*"[^>]*>(.*?)</div>\s*</div>', qc_html, re.DOTALL)
    print(f"\nOptions found (by 'option' class): {len(option_matches)}")
    for i, om in enumerate(option_matches[:4]):
        clean = re.sub(r'<[^>]+>', '', om).strip()
        print(f"  Option {i}: {clean[:200]}")
    
    # Find answer section
    ans_matches = re.findall(r'(?:Correct\s*(?:Answer|Option)|Answer)[^<]*<[^>]*>(.*?)</', qc_html, re.I | re.DOTALL)
    print(f"\nAnswer matches: {len(ans_matches)}")
    for am in ans_matches[:5]:
        print(f"  -> {am.strip()[:100]}")

    # Look for "Answer" heading or section in the page
    answer_section = re.search(r'Answer(.*?)(?:Solution|Explanation|$)', qc_html, re.DOTALL | re.I)
    if answer_section:
        ans_text = re.sub(r'<[^>]+>', ' ', answer_section.group(1)).strip()
        print(f"\nAnswer section text: {ans_text[:500]}")

    # Look for solution/explanation section
    sol_section = re.search(r'(?:Solution|Explanation)(.*?)(?:$)', qc_html[:20000], re.DOTALL | re.I)
    if sol_section:
        sol_text = re.sub(r'<[^>]+>', ' ', sol_section.group(1)).strip()
        print(f"\nSolution section text (first 500): {sol_text[:500]}")

# Also dump a smaller section of the SvelteKit data payload to find question keys
print("\n\n=== SvelteKit Data Payload Analysis ===")
# The second data element (node 8) contains the question page data
# Extract just that portion
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for s in scripts:
    if '__sveltekit' in s and 'data:' in s:
        # Find the second data element
        # Format: data: [{nav stuff...}, {question stuff...}]
        # Find position after the first }, which ends the nav element
        data_start = s.find('data: [')
        if data_start >= 0:
            data_str = s[data_start + 6:]  # After "data: "
            # Find where the second object starts (after first },...{)
            # We need to find the boundary between 1st and 2nd data elements
            # Count braces to find the split point
            depth = 0
            first_end = -1
            for ci, ch in enumerate(data_str):
                if ch == '{': depth += 1
                elif ch == '}': depth -= 1
                if depth == 0 and ci > 0:
                    first_end = ci
                    break
            
            if first_end > 0:
                second_part = data_str[first_end+1:].strip()
                if second_part.startswith(','):
                    second_part = second_part[1:].strip()
                print(f"Second data element (first 5000 chars):")
                print(second_part[:5000])
