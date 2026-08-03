"""
Discover all chapter URLs for Physics, Chemistry, and Mathematics from ExamSIDE.
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

SUBJECTS = {
    "physics": "https://questions.examside.com/past-years/jee/jee-advanced/physics",
    "chemistry": "https://questions.examside.com/past-years/jee/jee-advanced/chemistry",
    "mathematics": "https://questions.examside.com/past-years/jee/jee-advanced/mathematics",
}

for subject, url in SUBJECTS.items():
    print(f"\n{'='*60}")
    print(f"SUBJECT: {subject.upper()}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html_content = resp.read().decode('utf-8')
        
        # Find all chapter links: /past-years/jee/jee-advanced/physics/chapter-slug
        pattern = rf'href=["\'](/past-years/jee/jee-advanced/{subject}/([^"\'/?#]+))["\']'
        matches = re.findall(pattern, html_content)
        
        # Deduplicate keeping order
        seen = set()
        chapters = []
        for full_path, slug in matches:
            if slug not in seen and slug not in ['question']:
                seen.add(slug)
                chapters.append({"slug": slug, "path": full_path})
        
        for i, ch in enumerate(chapters):
            print(f"  {i+1:2d}. {ch['slug']:50s}  {ch['path']}")
        
        print(f"\n  Total chapters: {len(chapters)}")
        
    except Exception as e:
        print(f"  ERROR: {e}")
