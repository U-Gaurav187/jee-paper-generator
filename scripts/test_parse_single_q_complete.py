"""
Complete single question parser test.
"""
import re
import os
import html
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample_path = os.path.join(os.getcwd(), "scripts", "sample_q_page.html")
with open(sample_path, "r", encoding="utf-8") as f:
    html_content = f.read()

def clean_text(raw_text):
    if not raw_text:
        return ""
    # Unescape escaped HTML / quotes / newlines
    txt = raw_text.replace('\\"', '"').replace("\\'", "'").replace('\\n', '\n').replace('\\t', '\t')
    txt = html.unescape(txt)
    # Strip wrapping <p> and </p> tags
    txt = re.sub(r'^\s*<p>(.*?)</p>\s*$', r'\1', txt, flags=re.DOTALL)
    return txt.strip()

# Locate "question:{en:{"
pos = html_content.find("question:{en:")
if pos != -1:
    # Slice from pos to explanation end or section end
    block = html_content[pos : pos + 6000]

    # Content
    content_m = re.search(r'content:["\']((?:[^"\\]|\\.)*)["\']', block)
    q_text = clean_text(content_m.group(1)) if content_m else ""

    # Options
    options = []
    opt_matches = re.findall(r'\{identifier:["\']([A-D])["\']\s*,\s*content:["\']((?:[^"\\]|\\.)*)["\']\}', block)
    for ident, opt_raw in opt_matches:
        options.append(clean_text(opt_raw))

    # Correct Options
    corr_m = re.search(r'correct_options:\[(.*?)\]', block)
    correct_opts = []
    if corr_m:
        correct_opts = re.findall(r'["\']([A-D])["\']', corr_m.group(1))

    # Answer
    ans_m = re.search(r'answer:(?:["\']([^"\']+)["\']|([\d\.]+))', block)
    ans_val = ""
    if ans_m:
        ans_val = ans_m.group(1) or ans_m.group(2) or ""

    # Explanation
    exp_m = re.search(r'explanation:["\']((?:[^"\\]|\\.)*)["\']', block)
    solution = clean_text(exp_m.group(1)) if exp_m else ""

    # Type
    type_m = re.search(r'type:["\']([^"\']+)["\']', html_content)
    q_type = type_m.group(1) if type_m else "mcqm"

    print("=======================================")
    print("PARSED QUESTION RESULTS:")
    print("=======================================")
    print("QUESTION TEXT:\n", q_text)
    print("\nOPTIONS:")
    for idx, opt in enumerate(options):
        print(f"  [{chr(65+idx)}] {opt}")
    print("\nCORRECT OPTIONS / ANSWER:", correct_opts or ans_val)
    print("\nSOLUTION:\n", solution)
