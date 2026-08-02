import React, { useEffect, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';

let drawerInstance = null;

export default function SmilesRenderer({ smiles, width = 180, height = 140, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !smiles) return;

    if (!drawerInstance) {
      drawerInstance = new SmilesDrawer.Drawer({
        width: width,
        height: height,
        bondThickness: 1.5,
        bondLength: 15,
        shortBondLength: 0.85,
        bondSpacing: 0.18 * 15,
        atomVisualization: 'default',
        isPrimary: true,
        padding: 10,
        experimental: false,
        themes: {
          dark: {
            C: '#e2e8f0',
            O: '#ef4444',
            N: '#3b82f6',
            F: '#10b981',
            CL: '#10b981',
            BR: '#f59e0b',
            I: '#8b5cf6',
            BACKGROUND: 'transparent'
          },
          light: {
            C: '#1e293b',
            O: '#dc2626',
            N: '#2563eb',
            F: '#059669',
            CL: '#059669',
            BR: '#d97706',
            I: '#7c3aed',
            BACKGROUND: 'transparent'
          }
        }
      });
    }

    try {
      SmilesDrawer.parse(smiles, (tree) => {
        if (canvasRef.current) {
          drawerInstance.draw(tree, canvasRef.current, 'light', false);
        }
      }, (err) => {
        console.warn('Smiles parse error:', err);
      });
    } catch (e) {
      console.warn('SmilesDrawer error:', e);
    }
  }, [smiles, width, height]);

  return (
    <div className={`inline-flex flex-col items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-lg shadow-xs my-2 ${className}`}>
      <canvas ref={canvasRef} width={width} height={height} className="max-w-full h-auto" />
      <span className="text-[10px] font-mono text-slate-500 mt-1">Chemical Structure (SMILES: {smiles})</span>
    </div>
  );
}
