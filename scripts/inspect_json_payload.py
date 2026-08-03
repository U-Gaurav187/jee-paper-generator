"""
Print payload slice around index 420096.
"""
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample_path = os.path.join(os.getcwd(), "scripts", "sample_q_page.html")
with open(sample_path, "r", encoding="utf-8") as f:
    content = f.read()

snippet = content[419500:425000]
print("--- PAYLOAD SLICE 419500 to 425000 ---")
print(snippet)
