"""Quick test: scrape just 3 questions from Motion chapter to verify regex fix."""
import urllib.request
import re
import json
import os
import html
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

BASE_URL = "https://questions.examside.com"

def clean_text(raw_text):
    if not raw_text:
        return ""
    txt = raw_text.replace('\\u003C', '<').replace('\\u003c', '<').replace('\\u003E', '>').replace('\\u003e', '>')
    txt = txt.replace('\\"', '"').replace("\\'", "'").replace('\\\\', '\\')
    txt = html.unescape(txt)
    txt = txt.replace('\\n', '\n')
    txt = re.sub(r'<sub>(.*?)</sub>', lambda m: f'$_{{{m.group(1)}}}$', txt, flags=re.DOTALL)
    txt = re.sub(r'<sup>(.*?)</sup>', lambda m: f'$^{{{m.group(1)}}}$', txt, flags=re.DOTALL)
    txt = re.sub(r'<b>(.*?)</b>', r'**\1**', txt, flags=re.DOTALL)
    txt = re.sub(r'<br\s*/?>', '\n', txt)
    txt = re.sub(r'<img[^>]+>', '\n[Diagram]\n', txt)
    txt = re.sub(r'</?[a-zA-Z][^>]*>', '', txt)
    txt = re.sub(r'\n{3,}', '\n\n', txt)
    txt = re.sub(r'[ \t]+', ' ', txt)
    lines = [line.strip() for line in txt.split('\n')]
    txt = '\n'.join(lines)
    return txt.strip()

# Fetch Motion chapter
chapter_url = f"{BASE_URL}/past-years/jee/jee-advanced/physics/motion"
req = urllib.request.Request(chapter_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    page = resp.read().decode('utf-8')

q_links = re.findall(r'href=["\'](/past-years/jee/question/[^"\']+)["\']', page)
unique_links = list(dict.fromkeys(q_links))
print(f"Found {len(unique_links)} questions in Motion chapter")

# Test first 3
for i, link in enumerate(unique_links[:3]):
    url = BASE_URL + link
    print(f"\n--- Question {i+1} ---")
    print(f"URL: {url}")
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        html_content = resp.read().decode('utf-8')
    
    pos = html_content.find("question:{en:")
    if pos == -1:
        print("  NO payload found!")
        continue
    
    block = html_content[pos:pos+12000]
    hi_pos = block.find(",hi:{")
    en_block = block[:hi_pos] if hi_pos != -1 else block
    
    # Use the regex from the scraper
    content_m = re.search(r'content:"((?:[^"\\\\]|\\\\.)*)"', en_block)
    if not content_m:
        content_m = re.search(r"content:'((?:[^'\\\\]|\\\\.)*)'", en_block)
    
    if content_m:
        raw = content_m.group(1)
        cleaned = clean_text(raw)
        print(f"  ✅ MATCHED ({len(cleaned)} chars)")
        print(f"  Text: {cleaned[:200]}...")
    else:
        print(f"  ❌ REGEX FAILED!")
        # Show what content: looks like
        c_pos = en_block.find("content:")
        if c_pos != -1:
            print(f"  Raw: {en_block[c_pos:c_pos+200]}")
    
    time.sleep(0.5)
