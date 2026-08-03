"""
Find all occurrences of question text in sample_q_page.html
"""
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample_path = os.path.join(os.getcwd(), "scripts", "sample_q_page.html")
with open(sample_path, "r", encoding="utf-8") as f:
    content = f.read()

matches = [m.start() for m in re.finditer(r'Length, breadth', content)]
print(f"Total occurrences of 'Length, breadth': {len(matches)}")

for i, pos in enumerate(matches):
    print(f"\n--- Occurrence {i+1} at index {pos} ---")
    snippet = content[max(0, pos - 200): min(len(content), pos + 600)]
    print(snippet)
