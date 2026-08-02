import React, { useRef, useState } from 'react';
import { Download, Printer, ArrowLeft } from 'lucide-react';
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

  // Calculate sequential question numbers and group questions by section type
  const { groupedQuestions, totalAssignedQuestions } = React.useMemo(() => {
    let currentNumber = 1;
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
        const numberedQs = qs.map(q => {
          if (q.type === 'paragraph' && Array.isArray(q.subQuestions)) {
            const startNo = currentNumber;
            const endNo = currentNumber + q.subQuestions.length - 1;
            const subQsNumbered = q.subQuestions.map((subQ, idx) => ({
              ...subQ,
              qNo: startNo + idx
            }));
            currentNumber += q.subQuestions.length;
            return {
              ...q,
              startNo,
              endNo,
              subQuestions: subQsNumbered
            };
          } else {
            const qNo = currentNumber;
            currentNumber += 1;
            return {
              ...q,
              qNo
            };
          }
        });

        sections.push({
          type: t,
          title: typeTitles[t],
          questions: numberedQs
        });
      }
    });

    return { groupedQuestions: sections, totalAssignedQuestions: currentNumber - 1 };
  }, [paperQuestions]);

  // Native Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Download PDF using html2pdf.js targeting strictly the clean paper document node
  const handleDownloadPdf = () => {
    if (!paperRef.current) return;
    setIsGeneratingPdf(true);

    const element = paperRef.current;
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${metadata.testTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
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

  // Format Matrix Match Answer Keys for Answer Key Manual Table
  const formatAnswerKey = (q) => {
    if (typeof q.answerKey === 'string') return q.answerKey;
    if (Array.isArray(q.answerKey)) return q.answerKey.join(', ');
    if (typeof q.answerKey === 'object' && q.answerKey !== null) {
      return Object.entries(q.answerKey)
        .map(([col1, col2Arr]) => `${col1}→${Array.isArray(col2Arr) ? col2Arr.join('') : col2Arr}`)
        .join(' | ');
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (Web Screen Only - Explicitly Hidden during Print) */}
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
              2-Column A4 Printable Paper • Mode: {paperMode === 'question_with_solutions' ? 'Paper + Solution Manual' : 'Question Paper Only'}
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
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Vector PDF'}</span>
          </button>
        </div>
      </div>

      {/* Outer Web Container (Grey on screen, strictly white & unbordered on PDF export) */}
      <div className="print-only-container flex justify-center overflow-x-auto py-2 bg-slate-950 sm:p-4 rounded-2xl">
        
        {/* Pure A4 Paper Target Node (Targeted by html2pdf - 0 shadow, 0 outer border) */}
        <div
          ref={paperRef}
          className="jee-paper-document relative bg-white text-slate-950 p-6 sm:p-8 max-w-[210mm] w-full text-[10pt] leading-snug font-sans"
          style={{ minHeight: '297mm', boxSizing: 'border-box' }}
        >
          {/* Optional Background Watermark */}
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <span className="text-slate-200/40 text-5xl sm:text-6xl font-extrabold uppercase tracking-widest -rotate-45 font-mono text-center px-4">
                {watermarkText}
              </span>
            </div>
          )}

          <div className="relative z-10">
            
            {/* Document Header (Spans Full Width) */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                {metadata.instituteName || 'JEE ADVANCED EXAMINATION'}
              </h1>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {metadata.testTitle || 'JEE ADVANCED FULL MOCK TEST'}
              </h2>

              <div className="flex items-center justify-between text-[8.5pt] font-semibold text-slate-800 mt-2.5 pt-2 border-t border-slate-300">
                <span>Standard: {metadata.standard}</span>
                <span>Time Allowed: {metadata.timeAllowed}</span>
                <span>Max Marks: {totalAssignedQuestions * 4} Marks</span>
              </div>
            </div>

            {/* Test Instructions Box */}
            <div className="bg-slate-50 border border-slate-300 rounded p-2 mb-4 text-[8.5pt] text-slate-800 leading-tight">
              <span className="font-bold uppercase text-[9pt] block mb-0.5">Read the Following Instructions Carefully:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-[8.5pt]">
                <li>This question paper contains <strong>{totalAssignedQuestions} Questions</strong> split into 2 columns.</li>
                <li>Marking Scheme: {metadata.markingScheme}</li>
                <li>For Numerical / Integer type questions, enter the non-negative integer or decimal value.</li>
                <li>Use of calculators, smartwatches, or logarithmic tables is strictly prohibited.</li>
              </ol>
            </div>

            {/* 2-Column Question Layout Container */}
            <div className="jee-paper-preview">
              {groupedQuestions.map((sec) => (
                <div key={sec.type} className="mb-4">
                  
                  {/* Section Title Banner */}
                  <div className="span-all-columns bg-slate-100 border-y-2 border-slate-800 py-1 px-2 mb-3 font-bold text-[9pt] uppercase tracking-wide text-slate-900 text-center">
                    {sec.title}
                  </div>

                  {/* Questions inside Section */}
                  {sec.questions.map((q) => (
                    <div key={q.id} className="jee-question-card text-[9.5pt]">
                      
                      {/* Paragraph Passage Stem */}
                      {q.type === 'paragraph' ? (
                        <div className="mb-3">
                          
                          {/* Dynamic Passage Header: Passage for Questions X and Y */}
                          <div className="mb-3 bg-slate-50 border-l-4 border-slate-900 p-2.5 rounded-r border border-slate-200">
                            <span className="text-[8.5pt] uppercase font-extrabold tracking-wider text-indigo-900 block mb-1">
                              Passage for Questions {q.startNo} {q.startNo !== q.endNo ? `to ${q.endNo}` : ''}:
                            </span>
                            <div className="text-[9pt] text-slate-900 leading-snug font-serif">
                              <KaTeXRenderer text={q.paragraphText} />
                            </div>
                          </div>

                          {/* Sub-Questions with Clean Sequential Numbering Q.5, Q.6 */}
                          {q.subQuestions?.map((subQ) => (
                            <div key={subQ.subId} className="mt-2.5 pt-2 border-t border-slate-200/80 text-[9.5pt]">
                              <div className="font-bold text-slate-950 flex items-start gap-1">
                                <span className="font-mono text-slate-900 flex-shrink-0">
                                  Q.{subQ.qNo}.
                                </span>
                                <div className="font-normal">
                                  <KaTeXRenderer text={subQ.questionText} />
                                </div>
                              </div>

                              {subQ.options && (
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[9pt]">
                                  {subQ.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-start gap-1">
                                      <span className="font-semibold font-mono text-slate-800">({String.fromCharCode(65 + oIdx)})</span>
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
                          {/* Sequential Question Number & Text */}
                          <div className="font-bold flex items-start gap-1 text-slate-950">
                            <span className="font-mono text-slate-900 flex-shrink-0">Q.{q.qNo}.</span>
                            <div className="font-normal">
                              <KaTeXRenderer text={q.questionText} />
                            </div>
                          </div>

                          {/* Render Organic Chemistry SMILES Structure */}
                          {q.chemStructure && (
                            <div className="my-2 text-center">
                              <SmilesRenderer smiles={q.chemStructure} width={130} height={95} />
                            </div>
                          )}

                          {/* Render Vector SVG Media Diagram */}
                          {q.media && q.media.type === 'svg' && (
                            <div className="my-2 text-center" dangerouslySetInnerHTML={{ __html: q.media.content }} />
                          )}

                          {/* SCQ / MCQ Options */}
                          {q.options && (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[9pt] text-slate-900">
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
                            <div className="mt-2 text-[8.5pt] border border-slate-300 rounded p-1.5 bg-slate-50/60">
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <span className="font-bold text-slate-800 uppercase text-[8pt] border-b border-slate-300 block mb-1">Column I</span>
                                  {q.matrixMatch.column1.map((item, i) => (
                                    <div key={i} className="py-0.5 text-slate-900 leading-tight"><KaTeXRenderer text={item} /></div>
                                  ))}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 uppercase text-[8pt] border-b border-slate-300 block mb-1">Column II</span>
                                  {q.matrixMatch.column2.map((item, i) => (
                                    <div key={i} className="py-0.5 text-slate-900 leading-tight"><KaTeXRenderer text={item} /></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* SEPARATE ANSWER KEY & DETAILED SOLUTIONS MANUAL (IF SELECTED) */}
            {paperMode === 'question_with_solutions' && (
              <div className="mt-8 pt-6 border-t-2 border-slate-900 page-break-before">
                
                {/* Answer Key Grid Header */}
                <div className="text-center mb-4">
                  <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
                    ANSWER KEY MANUAL
                  </h2>
                  <p className="text-[8.5pt] text-slate-600 font-mono">{metadata.testTitle}</p>
                </div>

                {/* Grid Table of Sequential Answer Keys */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[8pt] mb-6">
                  {groupedQuestions.flatMap(sec => sec.questions).flatMap(q => {
                    if (q.type === 'paragraph' && Array.isArray(q.subQuestions)) {
                      return q.subQuestions.map(subQ => (
                        <div key={subQ.subId} className="border border-slate-400 p-1.5 bg-slate-50 rounded">
                          <span className="font-bold text-slate-700 mr-1">Q.{subQ.qNo}:</span>
                          <span className="font-bold text-indigo-800">{formatAnswerKey(subQ)}</span>
                        </div>
                      ));
                    }
                    return (
                      <div key={q.id} className="border border-slate-400 p-1.5 bg-slate-50 rounded">
                        <span className="font-bold text-slate-700 mr-1">Q.{q.qNo}:</span>
                        <span className="font-bold text-indigo-800">{formatAnswerKey(q)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step Solutions */}
                <div className="text-center mb-3 border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    STEP-BY-STEP DETAILED SOLUTIONS
                  </h3>
                </div>

                <div className="space-y-3 text-[9pt]">
                  {groupedQuestions.flatMap(sec => sec.questions).flatMap(q => {
                    if (q.type === 'paragraph' && Array.isArray(q.subQuestions)) {
                      return q.subQuestions.map(subQ => (
                        <div key={subQ.subId} className="border-b border-slate-200 pb-2">
                          <span className="font-bold font-mono text-indigo-900">
                            Question {subQ.qNo} ({q.subject} - {q.chapter}):
                          </span>
                          <div className="mt-1 text-slate-800 leading-relaxed font-sans bg-slate-50 p-2 rounded border border-slate-200 text-[8.5pt]">
                            <KaTeXRenderer text={subQ.solution || q.solution || 'Detailed step-by-step solution available in question repository.'} />
                          </div>
                        </div>
                      ));
                    }
                    return (
                      <div key={q.id} className="border-b border-slate-200 pb-2">
                        <span className="font-bold font-mono text-indigo-900">
                          Question {q.qNo} ({q.subject} - {q.chapter}):
                        </span>
                        <div className="mt-1 text-slate-800 leading-relaxed font-sans bg-slate-50 p-2 rounded border border-slate-200 text-[8.5pt]">
                          <KaTeXRenderer text={q.solution || 'Detailed step-by-step solution available in question repository.'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Page Branding */}
            <div className="mt-8 pt-2.5 border-t border-slate-300 flex items-center justify-between text-[8pt] text-slate-500 font-mono">
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
