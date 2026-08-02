import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Bulletproof KaTeX Math & Text Renderer
 * Sanitizes any malformed LaTeX strings before feeding them to KaTeX.
 */
export default function KaTeXRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || text === undefined || text === null) return;

    containerRef.current.innerHTML = '';
    let str = String(text);

    // 1. Fix malformed \t escapes and tab characters
    str = str
      .replace(/\\t\\text\{\\text\{/g, '\\text{')
      .replace(/\\t\\text\{/g, '\\text{')
      .replace(/\t\\text\{\\text\{/g, '\\text{')
      .replace(/\t\\text\{/g, '\\text{')
      .replace(/\\text\{\\text\{/g, '\\text{')
      .replace(/\\t\\text\{imes/g, '\\times')
      .replace(/\\t\\text\{heta/g, '\\theta')
      .replace(/\\t\\text\{an/g, '\\tan')
      .replace(/\\t\\text\{Delta/g, '\\Delta')
      .replace(/\t\\text\{imes/g, '\\times')
      .replace(/\t\\text\{heta/g, '\\theta')
      .replace(/\t\\text\{an/g, '\\tan')
      .replace(/\t\\text\{Delta/g, '\\Delta')
      .replace(/\times/g, '\\times')
      .replace(/\theta/g, '\\theta')
      .replace(/\tan/g, '\\tan')
      .replace(/\Delta/g, '\\Delta')
      .replace(/\t/g, ' ');

    // 2. Clean up any trailing unclosed braces from \text{\text{
    // Fix pattern like \text{HNO}_3 without extra closing brace issues
    str = str.replace(/\\text\{([^{}]+)\}_(\d)/g, '\\text{$1}_$2');

    // 3. Handle Markdown bold (**text**)
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 4. Split by math delimiters ($$...$$ and $...$)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const parts = str.split(regex);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2).trim();
        const span = document.createElement('span');
        span.className = 'my-1.5 block text-center overflow-x-auto py-0.5';
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch (e) {
          span.innerHTML = part;
        }
        containerRef.current.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        let math = part.slice(1, -1).trim();
        // Additional cleanup for math string
        math = math
          .replace(/\\text\{\\text\{/g, '\\text{')
          .replace(/\\t/g, ' ')
          .replace(/imes/g, '\\times')
          .replace(/\\times+/g, '\\times')
          .replace(/heta/g, '\\theta')
          .replace(/\\theta+/g, '\\theta');

        const span = document.createElement('span');
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.innerHTML = part;
        }
        containerRef.current.appendChild(span);
      } else {
        // Plain text
        const span = document.createElement('span');
        span.innerHTML = part.replace(/\n/g, '<br/>');
        containerRef.current.appendChild(span);
      }
    });
  }, [text]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}
