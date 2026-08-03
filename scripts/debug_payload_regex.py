"""
Debug payload regex matching on sample_q_page.html.
"""
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample_path = os.path.join(os.getcwd(), "scripts", "sample_q_page.html")
with open(sample_path, "r", encoding="utf-8") as f:
    html_content = f.read()

pos = html_content.find("question:{en:")
print(f"Position of 'question:{{en:': {pos}")

if pos != -1:
    snippet = html_content[pos : pos + 1000]
    print("\n--- SNIPPET FROM POSITION ---")
    print(snippet)

    # Test regex patterns
    m1 = re.search(r'question:\{en:(\{.*?\})', html_content)
    print(f"\nm1 matched: {bool(m1)}")
    if m1:
        print("m1 group 1 length:", len(m1.group(1)))
        print(m1.group(1)[:300])
