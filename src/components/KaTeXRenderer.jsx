import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Robust LaTeX & Markdown Text Renderer
 * Sanitizes JSON tab escapes (\t -> \text{...}), replaces bold markdown (**text**),
 * and renders inline ($...$) and block ($$...$$) math cleanly.
 */
export default function KaTeXRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    containerRef.current.innerHTML = '';

    // Step 1: Pre-process string to fix any JSON tab character (\t or \x09) corruption
    let sanitized = String(text)
      // Fix tab character followed by words (e.g. \tHNO3 -> \text{HNO}_3)
      .replace(/\t([A-Za-z0-9_+=\-()/]+)/g, (match, p1) => {
        if (p1 === 'Re') return '\\text{Re}';
        return `\\text{${p1}}`;
      })
      // Fix literal string "\t"
      .replace(/\\t/g, '\\text{')
      // Fix ext{
      .replace(/ext\{/g, '\\text{')
      // Fix unit vectors
      .replace(/\^i/g, '\\hat{i}')
      .replace(/\^j/g, '\\hat{j}')
      .replace(/\^k/g, '\\hat{k}');

    // Step 2: Handle Markdown bold (**text**) if outside math
    // Replace **text** with <strong>text</strong>
    const markdownRegex = /\*\*(.*?)\*\*/g;
    sanitized = sanitized.replace(markdownRegex, '<strong>$1</strong>');

    // Step 3: Split by math delimiters ($$...$$ and $...$)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const parts = sanitized.split(regex);

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
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
        const math = part.slice(1, -1);
        const span = document.createElement('span');
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.innerHTML = part;
        }
        containerRef.current.appendChild(span);
      } else {
        // Plain HTML text (preserving <strong> and line breaks)
        const span = document.createElement('span');
        span.innerHTML = part.replace(/\n/g, '<br/>');
        containerRef.current.appendChild(span);
      }
    });
  }, [text]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}
