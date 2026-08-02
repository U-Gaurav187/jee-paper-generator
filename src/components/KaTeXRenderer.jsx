import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Parses inline ($...$) and block ($$...$$) LaTeX expressions mixed with plain text.
 * Also sanitizes JSON tab-escaped strings (e.g. 'ext{' -> '\text{').
 */
export default function KaTeXRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Reset container
    containerRef.current.innerHTML = '';

    // Sanitize string if JSON tab escape converted \text to ext or \hat to ^
    let sanitizedText = text
      .replace(/ext\{/g, '\\text{')
      .replace(/\\ext\{/g, '\\text{')
      .replace(/(\s)ext\s/g, '$1\\text{ }')
      .replace(/\^i/g, '\\hat{i}')
      .replace(/\^j/g, '\\hat{j}')
      .replace(/\^k/g, '\\hat{k}');

    // Regex to split by $$...$$ (block) and $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const parts = sanitizedText.split(regex);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        const span = document.createElement('span');
        span.className = 'my-2 block text-center overflow-x-auto py-1';
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch (e) {
          span.textContent = part;
        }
        containerRef.current.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        const span = document.createElement('span');
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.textContent = part;
        }
        containerRef.current.appendChild(span);
      } else {
        // Plain text with line breaks
        const span = document.createElement('span');
        span.innerHTML = part.replace(/\n/g, '<br/>');
        containerRef.current.appendChild(span);
      }
    });
  }, [text]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}
