import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Parses inline ($...$) and block ($$...$$) LaTeX expressions mixed with plain text.
 */
export default function KaTeXRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Reset container
    containerRef.current.innerHTML = '';

    // Regex to split by $$...$$ (block) and $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const parts = text.split(regex);

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
