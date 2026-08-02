import React from 'react';
import { HelpCircle, CheckSquare, Square, CheckCircle2 } from 'lucide-react';

export default function WizardStep3_QuestionTypes({ selectedTypes, setSelectedTypes, questionsBank, onNext, onPrev }) {
  
  const questionTypeOptions = [
    {
      id: 'scq',
      title: 'Single Choice Questions (SCQ)',
      desc: 'One correct option out of 4 choices (A, B, C, D). Typical marking: +3 / -1.',
      badge: 'Single Choice'
    },
    {
      id: 'mcq',
      title: 'Multiple Choice Questions (MCQ)',
      desc: 'One or more than one correct options (e.g. A & C). Typical marking: +4 / -2 with partial marking.',
      badge: 'Multi-Correct'
    },
    {
      id: 'numerical',
      title: 'Numerical / Integer Answer Type',
      desc: 'Non-negative integer or decimal entry (e.g. 10 or 0.1). Typical marking: +3 / 0 or +4 / 0.',
      badge: 'Integer Value'
    },
    {
      id: 'paragraph',
      title: 'Paragraph / Comprehension Type',
      desc: 'A shared passage or mechanism stem followed by 2–3 linked sub-questions.',
      badge: 'Passage Linked'
    },
    {
      id: 'matrix_match',
      title: 'Matrix Match Type',
      desc: 'Match items from Column I (A, B, C, D) with Column II (P, Q, R, S, T). Standard JEE Advanced Section.',
      badge: 'Column I vs II'
    }
  ];

  const toggleType = (id) => {
    if (selectedTypes.includes(id)) {
      if (selectedTypes.length === 1) return; // Keep at least one
      setSelectedTypes(selectedTypes.filter(t => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          Step 3: JEE Advanced Question Types
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Select which question formats to include in this paper layout.
        </p>

        <div className="space-y-3">
          {questionTypeOptions.map(typeOpt => {
            const isSelected = selectedTypes.includes(typeOpt.id);
            const count = questionsBank.filter(q => q.type === typeOpt.id).length;

            return (
              <div
                key={typeOpt.id}
                onClick={() => toggleType(typeOpt.id)}
                className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/70 text-slate-100 shadow-md shadow-indigo-900/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isSelected ? <CheckSquare className="h-5 w-5 text-indigo-400" /> : <Square className="h-5 w-5 text-slate-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{typeOpt.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-indigo-300 rounded-md border border-slate-700">
                        {typeOpt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{typeOpt.desc}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-xs font-mono px-2 py-1 bg-slate-900 text-emerald-400 rounded-lg border border-slate-800">
                    {count} Available
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onPrev}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-sm transition-all cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Step 4: Question Count & Mode →
          </button>
        </div>
      </div>
    </div>
  );
}
