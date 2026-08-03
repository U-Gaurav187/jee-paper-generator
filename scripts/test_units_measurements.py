"""
Precision test scraper for ExamSIDE "Units & Measurements" (Physics).
Target URL: https://questions.examside.com/past-years/jee/jee-advanced/physics/units-and-measurements
"""
import urllib.request
import re
import json
import os
import html
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

BASE_URL = "https://questions.examside.com"
CHAPTER_URL = "https://questions.examside.com/past-years/jee/jee-advanced/physics/units-and-measurements"

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    print(f"Fetching chapter index page: {CHAPTER_URL}")
    html_content = fetch_html(CHAPTER_URL)
    if not html_content:
        print("Failed to fetch chapter page.")
        return

    # Find all question links on the page
    # Links usually look like: /past-years/jee/question/...
    q_links = re.findall(r'href=["\'](/past-years/jee/question/[^"\']+)["\']', html_content)
    unique_links = list(dict.fromkeys(q_links))
    print(f"Found {len(unique_links)} unique question links for Units & Measurements.")

    for i, link in enumerate(unique_links[:5]):
        print(f"\n[{i+1}] {BASE_URL}{link}")

if __name__ == "__main__":
    main()
