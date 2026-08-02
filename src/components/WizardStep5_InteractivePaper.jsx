import React, { useState } from 'react';
import { RefreshCw, Edit3, Trash2, ArrowUp, ArrowDown, Printer, Check, Eye } from 'lucide-react';
import KaTeXRenderer from './KaTeXRenderer';
import SmilesRenderer from './SmilesRenderer';

export default function WizardStep5_InteractivePaper({
  paperQuestions,
  setPaperQuestions,
  questionsBank,
  onProceedToPrint,
  onBackToWizard
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Swap question with a random alternative from bank of same subject & type
  const swapQuestion = (index) => {
    const current = paperQuestions[index];
    const pool = questionsBank.filter(
      q => q.subject === current.subject &&
           q.type === current.type &&
           !paperQuestions.some(pq => pq.id === q.id)
    );

    if (pool.length === 0) {
      alert(`No extra ${current.type.toUpperCase()} question available in bank for ${current.subject}.`);
      return;
    }

    const replacement = pool[Math.floor(Math.random() * pool.length)];
    const updated = [...paperQuestions];
    updated[index] = replacement;
    setPaperQuestions(updated);
  };

  const removeQuestion = (index) => {
    if (paperQuestions.length <= 1) return;
    setPaperQuestions(paperQuestions.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...paperQuestions];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setPaperQuestions(updated);
  };

  const moveDown = (index) => {
    if (index === paperQuestions.length - 1) return;
    const updated = [...paperQuestions];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setPaperQuestions(updated);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditText(q.questionText);
  };

  const saveEdit = (qId) => {
    setPaperQuestions(paperQuestions.map(q => q.id === qId ? { ...q, questionText: editText } : q));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Step 5: Review & Customize Question Set ({paperQuestions.length} Selected)
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Swap individual questions, reorder sections, or edit text before generating the 2-column A4 paper.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWizard}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              ← Adjust Filters
            </button>
            <button
              onClick={onProceedToPrint}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Preview 2-Column PDF Paper →</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {paperQuestions.map((q, idx) => (
            <div
              key={q.id + '_' + idx}
              className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-5 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 rounded-lg">
                    Q.{idx + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 font-medium rounded-md">
                    {q.subject}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-purple-300 font-mono rounded-md">
                    {q.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">({q.chapter})</span>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === paperQuestions.length - 1}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-lg cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => swapQuestion(idx)}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
                    title="Swap with another question from database"
                  >
                    <RefreshCw className="h-3 w-3 text-emerald-400" />
                    <span>Swap</span>
                  </button>
                  <button
                    onClick={() => startEdit(q)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                    title="Edit Question Text"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="p-1.5 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer"
                    title="Remove Question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Editor */}
              {editingId === q.id ? (
                <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-indigo-500/40">
                  <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(q.id)}
                      className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-200 leading-relaxed font-sans">
                  {q.type === 'paragraph' ? (
                    <div>
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-3 text-xs text-slate-300">
                        <KaTeXRenderer text={q.paragraphText} />
                      </div>
                      {q.subQuestions?.map((subQ, subIdx) => (
                        <div key={subQ.subId} className="ml-4 mt-2 text-xs">
                          <span className="font-semibold text-indigo-300">Q.{idx + 1}.{subIdx + 1} </span>
                          <KaTeXRenderer text={subQ.questionText} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <KaTeXRenderer text={q.questionText} />
                  )}

                  {/* Render Organic Chemistry SMILES Structure if present */}
                  {q.chemStructure && (
                    <div className="my-2">
                      <SmilesRenderer smiles={q.chemStructure} width={160} height={120} />
                    </div>
                  )}

                  {/* Options List */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-300">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80 flex items-center gap-2">
                          <span className="font-semibold font-mono text-indigo-400">({String.fromCharCode(65 + optIdx)})</span>
                          <KaTeXRenderer text={opt} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matrix Match Grid */}
                  {q.type === 'matrix_match' && q.matrixMatch && (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Column I</span>
                        {q.matrixMatch.column1.map((item, i) => (
                          <div key={i} className="py-0.5 text-slate-300"><KaTeXRenderer text={item} /></div>
                        ))}
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Column II</span>
                        {q.matrixMatch.column2.map((item, i) => (
                          <div key={i} className="py-0.5 text-slate-300"><KaTeXRenderer text={item} /></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onProceedToPrint}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Generate 2-Column Printable A4 PDF Paper →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
