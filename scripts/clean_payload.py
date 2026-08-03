"""
Pristine payload string sanitizer for ExamSIDE Svelte payload.
Fixes unicode escapes, HTML tags, and KaTeX escapes.
"""
import re
import html
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def sanitize_svelte_string(raw_str):
    if not raw_str:
        return ""
    
    # 1. Unescape raw JS string escapes
    # Replace unicode escapes like \u003Cp> -> <p>
    txt = raw_str.replace('\\u003C', '<').replace('\\u003c', '<').replace('\\u003E', '>').replace('\\u003e', '>')
    txt = txt.replace('\\"', '"').replace("\\'", "'").replace('\\\\', '\\')
    
    # 2. Fix tab escape corruptions in LaTeX strings
    txt = re.sub(r'\\t\\text', r'\\text', txt)
    txt = re.sub(r'\\times', r'\\times', txt)
    txt = re.sub(r'\\theta', r'\\theta', txt)
    txt = re.sub(r'\\tan', r'\\tan', txt)
    
    # 3. Unescape HTML entities (&mu; -> μ, &epsilon; -> ε)
    txt = html.unescape(txt)
    
    # 4. Remove wrapping <p> and </p> tags
    txt = re.sub(r'^\s*<p>(.*?)</p>\s*$', r'\1', txt, flags=re.DOTALL)
    
    return txt.strip()

# Test with sample problem
raw_q = '\\u003Cp>Length, breadth and thickness of a strip having a uniform cross section are measured to be \\u003Cb>10.5 cm\\u003C/b>, \\u003Cb>0.05 mm\\u003C/b>, and \\u003Cb>6.0 &mu;m\\u003C/b>, respectively. Which of the following option(s) give(s) the volume of the strip in cm\\u003Csup>3\\u003C/sup> with correct significant figures:\\u003C/p>'
print("SANITIZED QUESTION TEXT:")
print(sanitize_svelte_string(raw_q))

raw_sol = '\\u003Cp>$$ \\begin{aligned} & l=10.5 \\mathrm{~cm} \\rightarrow 3 \\mathrm{SF} \\\\ & b=0.05 \\mathrm{~mm}=5 \\times 10^{-3} \\mathrm{~cm} \\rightarrow 1 \\mathrm{SF} \\\\ & h=6.0 \\mu \\mathrm{~m}=6.0 \\times 10^{-4} \\mathrm{~cm} \\rightarrow 2 \\mathrm{SF} \\end{aligned} $$\\u003C/p>\\n\\u003Cp>we know, $V=$ lbh\\u003C/p>\\n\\u003Cp>\\u003C/p>\\n\\u003Cp>$$ \\begin{aligned}So\\,\\,\\,\\, v & =10.5 \\times 5 \\times 10^{-3} \\times 6.0 \\times 10^{-4} \\\\ & =315 \\times 10^{-7} \\mathrm{~cm}^3 \\\\ & =3.15 \\times 10^{-5} \\mathrm{~cm}^3 \\end{aligned} $$\\u003C/p>\\n\\u003Cp>The final answer should have the same number of significant figures as the factor with the fewest significant figures.\\u003C/p>\\n\\u003Cp>$$ \\text { So } V=3 \\times 10^{-5} \\mathrm{~cm}^3 \\quad \\rightarrow 1 \\mathrm{SF} $$\\u003C/p>'

print("\nSANITIZED SOLUTION TEXT:")
print(sanitize_svelte_string(raw_sol))
