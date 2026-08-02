import urllib.request
import re
import json

url = "https://questions.examside.com/past-years/jee/question/ptwo-charges-q1--q-and-q2--mq-are-placed-at-the-po-jee-advanced-physics-6hcyvamjdo9dperl"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Search for paragraph text containing HTML tags like <p>Two charges...
paragraphs = re.findall(r'<p>.*?</p>', html)
print(f"Found {len(paragraphs)} paragraph tags:")
for p in paragraphs[:15]:
    print(" -", p)

# Search for images with src containing examgoal/cdn
images = re.findall(r'src=["\'](https?://[^"\']+)["\']', html)
print(f"\nFound {len(images)} image URLs:")
for img in images:
    if 'examgoal' in img or 'assets' in img:
        print(" -", img)
