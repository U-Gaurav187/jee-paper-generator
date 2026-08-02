import React from 'react';
import { Sliders, FileText, CheckCircle2, ListOrdered } from 'lucide-react';

export default function WizardStep4_OutputConfig({
  targetCount,
  setTargetCount,
  customCount,
  setCustomCount,
  paperMode,
  setPaperMode,
  availableTotal,
  onGenerate,
  onPrev
}) {

  const countPresets = [
    { label: '10 Questions', count: 10, desc: 'Quick 30-min Chapter Test' },
    { label: '30 Questions', count: 30, desc: 'Standard 1-Hour Test' },
    { label: '54 Questions', count: 54, desc: 'JEE Advanced Paper 1 Standard' },
    { label: '108 Questions', count: 108, desc: 'Full 2-Paper JEE Adv Mock' },
    { label: 'Custom', count: 'custom', desc: 'Specify exact number' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
          <Sliders className="h-5 w-5 text-indigo-400" />
          Step 4: Question Count & Paper Output Mode
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Configure how many questions to pick and whether to include the detailed solution manual.
        </p>

        {/* Question Count Selection */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Select Number of Questions (Filtered Pool: {availableTotal} Available)
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {countPresets.map((preset) => {
              const isSelected = targetCount === preset.count;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTargetCount(preset.count)}
                  className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-base">{preset.label}</span>
                  <span className="text-[11px] text-slate-400 mt-1">{preset.desc}</span>
                </button>
              );
            })}
          </div>

          {targetCount === 'custom' && (
            <div className="mt-4 p-4 bg-slate-950/80 border border-indigo-500/40 rounded-xl flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-300">Enter Custom Count:</label>
              <input
                type="number"
                min="1"
                max={availableTotal}
                value={customCount}
                onChange={(e) => setCustomCount(parseInt(e.target.value) || 10)}
                className="w-28 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 font-mono"
              />
              <span className="text-xs text-slate-400">Max available: {availableTotal}</span>
            </div>
          )}
        </div>

        {/* Paper Mode Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Output Type / Document Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPaperMode('question_only')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                paperMode === 'question_only'
                  ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 shadow-lg shadow-indigo-900/30'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Question Paper Only
                </span>
                {paperMode === 'question_only' && <CheckCircle2 className="h-5 w-5 text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a clean 2-column A4 test paper for students to attempt under exam conditions (Instructions + Questions only).
              </p>
            </div>

            <div
              onClick={() => setPaperMode('question_with_solutions')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                paperMode === 'question_with_solutions'
                  ? 'bg-purple-950/40 border-purple-500 text-slate-100 shadow-lg shadow-purple-900/30'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-white flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-purple-400" />
                  Question Paper + Detailed Solutions
                </span>
                {paperMode === 'question_with_solutions' && <CheckCircle2 className="h-5 w-5 text-purple-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates the test paper followed by an **Answer Key Grid & Step-by-Step Solution Manual** on separate final pages.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onPrev}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-sm transition-all cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={onGenerate}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>✨ Generate JEE Question Paper Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
