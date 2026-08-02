import React, { useState } from 'react';
import { Search, Filter, Database, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import KaTeXRenderer from './KaTeXRenderer';
import SmilesRenderer from './SmilesRenderer';

export default function QuestionBankBrowser({ questionsBank, onOpenIngestionGuide }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const filteredQuestions = questionsBank.filter(q => {
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesType = selectedType === 'All' || q.type === selectedType;
    const matchesSearch = searchTerm === '' ||
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">JEE Advanced Question Repository</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Browse, search, and inspect LaTeX formulas, chemical SMILES structures, and step-by-step solutions.
          </p>
        </div>

        <button
          onClick={onOpenIngestionGuide}
          className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>⚡ Bulk Ingest New Questions →</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by text, formula, or chapter..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
        </div>

        {/* Subject Filter */}
        <div className="w-full sm:w-48">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Subjects ({questionsBank.length})</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-48">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Question Types</option>
            <option value="scq">Single Choice (SCQ)</option>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="numerical">Numerical / Integer</option>
            <option value="paragraph">Paragraph / Passage</option>
            <option value="matrix_match">Matrix Match</option>
          </select>
        </div>

      </div>

      {/* Questions Cards Grid */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            No questions match the selected search criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 rounded-lg">
                    #{idx + 1}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-200 font-semibold rounded-md">
                    {q.subject}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-purple-300 font-mono rounded-md">
                    {q.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">({q.chapter})</span>
                </div>

                <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Difficulty: {q.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-sm text-slate-200 leading-relaxed font-sans my-3">
                {q.type === 'paragraph' ? (
                  <div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3 text-xs text-slate-300">
                      <KaTeXRenderer text={q.paragraphText} />
                    </div>
                    {q.subQuestions?.map((subQ, sIdx) => (
                      <div key={subQ.subId} className="ml-4 mt-2 text-xs">
                        <span className="font-semibold text-indigo-300">Sub-Q {sIdx + 1}: </span>
                        <KaTeXRenderer text={subQ.questionText} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <KaTeXRenderer text={q.questionText} />
                )}

                {/* Render Chemical SMILES Structure if present */}
                {q.chemStructure && (
                  <div className="my-2">
                    <SmilesRenderer smiles={q.chemStructure} width={160} height={120} />
                  </div>
                )}

                {/* Render Vector SVG Diagram if present */}
                {q.media && q.media.type === 'svg' && (
                  <div className="my-2 text-center" dangerouslySetInnerHTML={{ __html: q.media.content }} />
                )}

                {/* Options List */}
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-300">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                        <span className="font-semibold font-mono text-indigo-400">({String.fromCharCode(65 + oIdx)})</span>
                        <KaTeXRenderer text={opt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solution Accordion */}
              <details className="mt-4 border-t border-slate-800/80 pt-3 group">
                <summary className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 select-none">
                  <span>View Answer Key & Step-by-Step Solution</span>
                </summary>
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  <div className="font-bold text-emerald-400 mb-1">
                    Answer Key: {typeof q.answerKey === 'object' ? JSON.stringify(q.answerKey) : q.answerKey}
                  </div>
                  <KaTeXRenderer text={q.solution || 'No detailed solution.'} />
                </div>
              </details>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
