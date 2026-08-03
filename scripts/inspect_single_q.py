"""
Inspect HTML structure of a single question page.
"""
import urllib.request
import re
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = "https://questions.examside.com/past-years/jee/question/plength-breadth-and-thickness-of-a-strip-having-a-uniform-jee-advanced-physics-d0kpgeigoayr3ug1"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    page_html = resp.read().decode('utf-8')

out_path = os.path.join(os.getcwd(), "scripts", "sample_q_page.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(page_html)

print(f"Saved sample page ({len(page_html)} bytes) to {out_path}")
