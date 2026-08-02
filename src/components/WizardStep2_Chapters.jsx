import React from 'react';
import { Layers, CheckCircle2, Circle } from 'lucide-react';

export default function WizardStep2_Chapters({ selectedSubjects, setSelectedSubjects, selectedChapters, setSelectedChapters, questionsBank, onNext, onPrev }) {
  
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'];

  const toggleSubject = (sub) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length === 1) return; // keep at least 1
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  // Extract unique chapters available for currently selected subjects
  const availableChapters = React.useMemo(() => {
    const map = {};
    questionsBank.forEach(q => {
      if (selectedSubjects.includes(q.subject)) {
        if (!map[q.chapter]) {
          map[q.chapter] = { subject: q.subject, count: 0 };
        }
        map[q.chapter].count++;
      }
    });
    return map;
  }, [questionsBank, selectedSubjects]);

  const chapterNames = Object.keys(availableChapters);

  const toggleChapter = (chap) => {
    if (selectedChapters.includes(chap)) {
      setSelectedChapters(selectedChapters.filter(c => c !== chap));
    } else {
      setSelectedChapters([...selectedChapters, chap]);
    }
  };

  const selectAllChapters = () => {
    setSelectedChapters(chapterNames);
  };

  const clearAllChapters = () => {
    setSelectedChapters([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
          <Layers className="h-5 w-5 text-indigo-400" />
          Step 2: Subject & Chapter Selection
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Choose which subjects and chapters to pull questions from for this exam.
        </p>

        {/* Subject Filter Pills */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Target Subjects
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subjects.map(sub => {
              const isSelected = selectedSubjects.includes(sub);
              const count = questionsBank.filter(q => q.subject === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? <CheckCircle2 className="h-4 w-4 text-indigo-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
                    <span>{sub}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
                    {count} Qs
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter Selection Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Available Chapters ({chapterNames.length})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllChapters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={clearAllChapters}
                className="text-xs text-slate-500 hover:text-slate-400 font-medium cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
            {chapterNames.map(chap => {
              const isSelected = selectedChapters.includes(chap);
              const info = availableChapters[chap];
              return (
                <div
                  key={chap}
                  onClick={() => toggleChapter(chap)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" /> : <Circle className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />}
                    <span className="truncate">{chap}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded-md border border-slate-800">
                    {info.subject.slice(0, 3).toUpperCase()} ({info.count})
                  </span>
                </div>
              );
            })}
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
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Step 3: Choose Question Types →
          </button>
        </div>
      </div>
    </div>
  );
}
