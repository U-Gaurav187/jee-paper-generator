import React from 'react';
import { X, Terminal, Code, Cpu, UploadCloud, CheckCircle2, Copy } from 'lucide-react';

export default function IngestionGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const copyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    alert(`Copied to clipboard: "${cmd}"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-2xl">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bulk Question Ingestion Guide</h2>
            <p className="text-xs text-slate-400 font-mono">Automated Python & Node CLI Scripts</p>
          </div>
        </div>

        {/* Guide Content */}
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
              <Cpu className="h-4 w-4" /> 1. Run Node.js Ingestion & Validation CLI
            </h3>
            <p className="text-slate-400">
              Run this script after adding raw questions into JSON files (`public/data/questions/*.json`). It validates question schemas, option arrays, matrix match tables, and SMILES chemical formulas:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 flex items-center justify-between">
              <span>npm run ingest</span>
              <button onClick={() => copyCommand('npm run ingest')} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-purple-300 flex items-center gap-2">
              <Code className="h-4 w-4" /> 2. Run Python Question Converter
            </h3>
            <p className="text-slate-400">
              For web scraping or parsing raw text files into the question bank, use the included Python script:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-purple-300 border border-slate-800 flex items-center justify-between">
              <span>python scripts/ingest_questions.py raw_data.json Physics</span>
              <button onClick={() => copyCommand('python scripts/ingest_questions.py raw_data.json Physics')} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-pink-300 flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> 3. Deploy to Vercel with 1 Command
            </h3>
            <p className="text-slate-400">
              Pushing your code to GitHub automatically deploys your web application to Vercel for free! Or deploy directly using Vercel CLI:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-pink-400 border border-slate-800 flex items-center justify-between">
              <span>npx vercel</span>
              <button onClick={() => copyCommand('npx vercel')} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
