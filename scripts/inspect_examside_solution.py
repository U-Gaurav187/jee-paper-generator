import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/question/ptwo-charges-q1--q-and-q2--mq-are-placed-at-the-po-jee-advanced-physics-6hcyvamjdo9dperl"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Search for any API endpoints (cdn.examgoal, app-content, api)
apis = re.findall(r'https?://[^"\'\s>]+', html)
print(f"Total URLs found: {len(apis)}")
for a in set(apis):
    if any(k in a.lower() for k in ['json', 'api', 'solution', 'content', 'cdn']):
        print(" ->", a)
