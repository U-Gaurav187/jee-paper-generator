import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Bulletproof KaTeX Math & Text Renderer
 * Sanitizes and renders inline and block LaTeX without raw \n artifacts or broken formulas.
 */
export default function KaTeXRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || text === undefined || text === null) return;

    containerRef.current.innerHTML = '';
    let str = String(text);

    // 1. Clean literal '\n' string escapes (e.g. '\n' written as literal backslash-n in string)
    str = str.replace(/\\n/g, '\n');

    // 2. Fix double-escaped backslashes in LaTeX commands
    str = str.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    str = str.replace(/\\\\Delta/g, '\\Delta');
    str = str.replace(/\\\\text/g, '\\text');

    // 3. Convert un-delimited \begin{aligned} ... \end{aligned} into block math $$ \begin{aligned} ... \end{aligned} $$
    str = str.replace(/(?<!\$\$)\s*\\begin\{(aligned|equation|array|gather)\}([\s\S]*?)\\end\{\1\}\s*(?!\$\$)/g, '\n$$\n\\begin{$1}$2\\end{$1}\n$$\n');

    // 4. Fix common LaTeX escape corruptions
    str = str
      .replace(/\\t\\text\{\\text\{/g, '\\text{')
      .replace(/\\t\\text\{/g, '\\text{')
      .replace(/\t\\text\{/g, '\\text{')
      .replace(/\\t\\text\{imes/g, '\\times')
      .replace(/\\t\\text\{heta/g, '\\theta')
      .replace(/\\t\\text\{an/g, '\\tan')
      .replace(/\\t\\text\{Delta/g, '\\Delta')
      .replace(/\\t/g, ' ');

    // 5. Clean up multiple empty \n lines
    str = str.replace(/\n{3,}/g, '\n\n');

    // 6. Handle Markdown bold (**text**)
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 7. Split by math delimiters ($$...$$ and $...$)
    // Match $$...$$ (block math) and $...$ (inline math across newlines)
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
    const parts = str.split(regex);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        let math = part.slice(2, -2).trim();
        math = math.replace(/\\n/g, ' ');
        const span = document.createElement('span');
        span.className = 'my-1.5 block text-center overflow-x-auto py-0.5';
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch (e) {
          span.innerHTML = part;
        }
        containerRef.current.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        let math = part.slice(1, -1).trim();
        math = math.replace(/\n/g, ' ').replace(/\\n/g, ' ');

        const span = document.createElement('span');
        span.className = 'inline-block px-0.5';
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.innerHTML = part;
        }
        containerRef.current.appendChild(span);
      } else {
        // Plain text section
        const span = document.createElement('span');
        // Convert real newlines to <br/>
        const htmlContent = part.replace(/\n/g, '<br/>');
        span.innerHTML = htmlContent;
        containerRef.current.appendChild(span);
      }
    });
  }, [text]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}
