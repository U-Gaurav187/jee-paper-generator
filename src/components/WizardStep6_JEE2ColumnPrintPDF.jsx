import React, { useRef, useState } from 'react';
import { Download, Printer, ArrowLeft, Eye, ShieldCheck, FileCheck } from 'lucide-react';
import KaTeXRenderer from './KaTeXRenderer';
import SmilesRenderer from './SmilesRenderer';
import html2pdf from 'html2pdf.js';

export default function WizardStep6_JEE2ColumnPrintPDF({
  metadata,
  paperQuestions,
  paperMode,
  onBackToEdit
}) {
  const paperRef = useRef(null);
  const [watermarkText, setWatermarkText] = useState(metadata.instituteName || 'JEE ADVANCED TEST');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Group questions by type to form authentic JEE Advanced Section headers
  const groupedQuestions = React.useMemo(() => {
    const sections = [];
    const types = ['scq', 'mcq', 'numerical', 'paragraph', 'matrix_match'];
    const typeTitles = {
      scq: 'SECTION I: SINGLE CORRECT CHOICE QUESTIONS (+3 Marks / -1 Mark)',
      mcq: 'SECTION II: MULTIPLE CORRECT CHOICE QUESTIONS (+4 Marks / -2 Marks)',
      numerical: 'SECTION III: NUMERICAL / INTEGER VALUE TYPE (+3 Marks / 0 Marks)',
      paragraph: 'SECTION IV: COMPREHENSION / PARAGRAPH BASED QUESTIONS (+3 Marks / -1 Mark)',
      matrix_match: 'SECTION V: MATRIX MATCH TYPE (+4 Marks / -1 Mark)'
    };

    types.forEach(t => {
      const qs = paperQuestions.filter(q => q.type === t);
      if (qs.length > 0) {
        sections.push({
          type: t,
          title: typeTitles[t],
          questions: qs
        });
      }
    });
    return sections;
  }, [paperQuestions]);

  // Native Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Download PDF using html2pdf.js
  const handleDownloadPdf = () => {
    if (!paperRef.current) return;
    setIsGeneratingPdf(true);

    const element = paperRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${metadata.testTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    }).catch(err => {
      console.error('PDF download error:', err);
      setIsGeneratingPdf(false);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (Web Screen Only) */}
      <div className="no-print bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-20 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Edit Questions</span>
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{metadata.testTitle}</h3>
            <p className="text-xs text-slate-400 font-mono">
              2-Column A4 PDF • Mode: {paperMode === 'question_with_solutions' ? 'Paper + Solution Manual' : 'Question Paper Only'}
            </p>
          </div>
        </div>

        {/* Watermark Controls & Download Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Watermark</span>
            </label>
            {showWatermark && (
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Watermark Text"
                className="w-28 bg-slate-900 border border-slate-700 text-slate-200 text-[11px] px-2 py-0.5 rounded focus:outline-hidden"
              />
            )}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Printer className="h-4 w-4 text-indigo-400" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Document'}</span>
          </button>
        </div>
      </div>

      {/* Printable A4 2-Column Test Paper Render Container */}
      <div className="print-only-container flex justify-center overflow-x-auto py-4 bg-slate-950 sm:p-6 rounded-2xl">
        
        <div
          ref={paperRef}
          className="relative bg-white text-slate-950 p-6 sm:p-10 rounded shadow-2xl max-w-[210mm] w-full text-[11pt] leading-normal font-sans"
          style={{ minHeight: '297mm' }}
        >
          {/* Optional Watermark */}
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <span className="text-slate-200/40 text-5xl sm:text-6xl font-extrabold uppercase tracking-widest -rotate-45 font-mono text-center px-4">
                {watermarkText}
              </span>
            </div>
          )}

          <div className="relative z-10">
            {/* Header Block (Full Width Across Both Columns) */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                {metadata.instituteName || 'JEE ADVANCED EXAMINATION'}
              </h1>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                {metadata.testTitle || 'JEE ADVANCED FULL MOCK TEST'}
              </h2>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mt-3 pt-2 border-t border-slate-300">
                <span>Standard: {metadata.standard}</span>
                <span>Time Allowed: {metadata.timeAllowed}</span>
                <span>Max Marks: {paperQuestions.length * 4} Marks</span>
              </div>
            </div>

            {/* General Test Instructions Box */}
            <div className="bg-slate-50 border border-slate-300 rounded p-2.5 mb-5 text-[9.5pt] text-slate-800 leading-snug">
              <span className="font-bold uppercase text-[10pt] block mb-1">Read the Following Instructions Carefully:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-[9pt]">
                <li>This question paper contains <strong>{paperQuestions.length} Questions</strong> split into 2 columns.</li>
                <li>Marking Scheme: {metadata.markingScheme}</li>
                <li>For Numerical / Integer type questions, enter the non-negative integer or decimal value.</li>
                <li>Use of calculators, smartwatches, or logarithmic tables is strictly prohibited.</li>
              </ol>
            </div>

            {/* 2-Column Question Layout Container */}
            <div className="jee-paper-preview">
              {groupedQuestions.map((sec, secIdx) => (
                <div key={sec.type} className="mb-6">
                  {/* Section Title Banner */}
                  <div className="span-all-columns bg-slate-100 border-y-2 border-slate-800 py-1 px-2 mb-4 font-bold text-[10pt] uppercase tracking-wide text-slate-900 text-center">
                    {sec.title}
                  </div>

                  {/* Section Questions */}
                  {sec.questions.map((q, qIdx) => {
                    // Global question number across paper
                    const globalIndex = paperQuestions.findIndex(item => item.id === q.id) + 1;

                    return (
                      <div key={q.id} className="jee-question-card text-[10.5pt]">
                        
                        {/* Paragraph Passage Stem */}
                        {q.type === 'paragraph' ? (
                          <div className="mb-3">
                            <div className="bg-slate-50 border-l-2 border-slate-700 p-2 text-[9.5pt] mb-2 text-slate-800 font-serif italic">
                              <KaTeXRenderer text={q.paragraphText} />
                            </div>

                            {q.subQuestions?.map((subQ, subIdx) => (
                              <div key={subQ.subId} className="mt-3">
                                <div className="font-bold flex items-start gap-1">
                                  <span>Q.{globalIndex}.{subIdx + 1}</span>
                                  <KaTeXRenderer text={subQ.questionText} />
                                </div>

                                {subQ.options && (
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[10pt]">
                                    {subQ.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-start gap-1">
                                        <span className="font-semibold font-mono">({String.fromCharCode(65 + oIdx)})</span>
                                        <KaTeXRenderer text={opt} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            {/* Standard Question Header */}
                            <div className="font-bold flex items-start gap-1 text-slate-950">
                              <span className="font-mono text-slate-900 flex-shrink-0">Q.{globalIndex}.</span>
                              <div className="font-normal">
                                <KaTeXRenderer text={q.questionText} />
                              </div>
                            </div>

                            {/* Render Chemical SMILES Structure if present */}
                            {q.chemStructure && (
                              <div className="my-2 text-center">
                                <SmilesRenderer smiles={q.chemStructure} width={150} height={110} />
                              </div>
                            )}

                            {/* Render Vector SVG Media Diagram if present */}
                            {q.media && q.media.type === 'svg' && (
                              <div className="my-2 text-center" dangerouslySetInnerHTML={{ __html: q.media.content }} />
                            )}

                            {/* SCQ / MCQ Options (2-Column format) */}
                            {q.options && (
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10pt] text-slate-900">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-start gap-1">
                                    <span className="font-semibold font-mono text-slate-800">({String.fromCharCode(65 + oIdx)})</span>
                                    <KaTeXRenderer text={opt} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Matrix Match Type Grid Table */}
                            {q.type === 'matrix_match' && q.matrixMatch && (
                              <div className="mt-2 text-[9.5pt] border border-slate-300 rounded p-2 bg-slate-50/50">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="font-bold text-slate-800 uppercase text-[9pt] border-b border-slate-300 block mb-1">Column I</span>
                                    {q.matrixMatch.column1.map((item, i) => (
                                      <div key={i} className="py-0.5 text-slate-900"><KaTeXRenderer text={item} /></div>
                                    ))}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800 uppercase text-[9pt] border-b border-slate-300 block mb-1">Column II</span>
                                    {q.matrixMatch.column2.map((item, i) => (
                                      <div key={i} className="py-0.5 text-slate-900"><KaTeXRenderer text={item} /></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* SEPARATE ANSWER KEY & DETAILED SOLUTIONS MANUAL (IF SELECTED) */}
            {paperMode === 'question_with_solutions' && (
              <div className="mt-12 pt-8 border-t-4 border-slate-900 page-break-before">
                
                {/* Answer Key Grid Header */}
                <div className="text-center mb-6">
                  <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">
                    ANSWER KEY MANUAL
                  </h2>
                  <p className="text-xs text-slate-600 font-mono">{metadata.testTitle}</p>
                </div>

                {/* Grid Table of Answer Keys */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center font-mono text-[9pt] mb-8">
                  {paperQuestions.map((q, idx) => {
                    let ansDisplay = '';
                    if (typeof q.answerKey === 'string') ansDisplay = q.answerKey;
                    else if (Array.isArray(q.answerKey)) ansDisplay = q.answerKey.join(',');
                    else if (typeof q.answerKey === 'object') ansDisplay = JSON.stringify(q.answerKey).replace(/[{}"\\]/g, '');

                    return (
                      <div key={q.id} className="border border-slate-400 p-1 bg-slate-50">
                        <span className="block text-[8pt] text-slate-500 font-bold">Q.{idx + 1}</span>
                        <span className="font-bold text-indigo-700 text-[10pt]">{ansDisplay || '-'}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step Solutions */}
                <div className="text-center mb-4 border-b border-slate-300 pb-2">
                  <h3 className="text-base font-black uppercase text-slate-900 tracking-wider">
                    STEP-BY-STEP DETAILED SOLUTIONS
                  </h3>
                </div>

                <div className="space-y-4 text-[10pt]">
                  {paperQuestions.map((q, idx) => (
                    <div key={q.id} className="border-b border-slate-200 pb-3">
                      <span className="font-bold font-mono text-indigo-900 text-[10.5pt]">
                        Question {idx + 1} ({q.subject} - {q.chapter}):
                      </span>
                      <div className="mt-1 text-slate-800 leading-relaxed font-sans bg-slate-50 p-2.5 rounded border border-slate-200">
                        <KaTeXRenderer text={q.solution || 'Detailed step-by-step solution available in question repository.'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Page Branding */}
            <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[8.5pt] text-slate-500 font-mono">
              <span>{metadata.instituteName}</span>
              <span>JEE Advanced PaperGen Engine</span>
              <span>End of Question Paper</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
