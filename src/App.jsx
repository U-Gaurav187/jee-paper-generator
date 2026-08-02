import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WizardStep1_Metadata from './components/WizardStep1_Metadata';
import WizardStep2_Chapters from './components/WizardStep2_Chapters';
import WizardStep3_QuestionTypes from './components/WizardStep3_QuestionTypes';
import WizardStep4_OutputConfig from './components/WizardStep4_OutputConfig';
import WizardStep5_InteractivePaper from './components/WizardStep5_InteractivePaper';
import WizardStep6_JEE2ColumnPrintPDF from './components/WizardStep6_JEE2ColumnPrintPDF';
import QuestionBankBrowser from './components/QuestionBankBrowser';
import IngestionGuideModal from './components/IngestionGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'bank'
  const [wizardStep, setWizardStep] = useState(1); // 1 to 6
  const [isIngestionGuideOpen, setIsIngestionGuideOpen] = useState(false);

  // Master Question Repository Loaded from Modular JSON Files
  const [questionsBank, setQuestionsBank] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wizard Configuration State
  const [metadata, setMetadata] = useState({
    testTitle: 'JEE Advanced Full Mock Test - 01',
    instituteName: 'Apex IIT-JEE Academy',
    examPattern: 'JEE Advanced Paper 1',
    standard: 'Combined (11th + 12th)',
    timeAllowed: '180 Minutes (3 Hours)',
    markingScheme: '+3 / -1 for SCQ, +4 / -2 for MCQ, +3 / 0 for Numerical'
  });

  const [selectedSubjects, setSelectedSubjects] = useState(['Physics', 'Chemistry', 'Mathematics']);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['scq', 'mcq', 'numerical', 'paragraph', 'matrix_match']);
  
  const [targetCount, setTargetCount] = useState(10);
  const [customCount, setCustomCount] = useState(10);
  const [paperMode, setPaperMode] = useState('question_only'); // 'question_only' | 'question_with_solutions'

  // Generated Paper Questions Set
  const [paperQuestions, setPaperQuestions] = useState([]);

  // Fetch modular questions dynamically from index.json manifest
  useEffect(() => {
    async function loadAllQuestions() {
      setIsLoading(true);
      let allQs = [];
      
      // Determine base URL dynamically for GitHub Pages & Vercel
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

      try {
        // Fetch manifest index.json listing all registered chapter files
        const indexRes = await fetch(`${cleanBase}data/questions/index.json`);
        if (indexRes.ok) {
          const fileList = await indexRes.json();
          for (const fileRelPath of fileList) {
            try {
              const qRes = await fetch(`${cleanBase}data/questions/${fileRelPath}`);
              if (qRes.ok) {
                const qData = await qRes.json();
                allQs = [...allQs, ...qData];
              }
            } catch (e) {
              console.warn(`Failed to fetch modular chapter: ${fileRelPath}`, e);
            }
          }
        }
      } catch (err) {
        console.warn('Dynamic fetch failed, falling back to bundled dataset:', err);
      }

      setQuestionsBank(allQs);
      
      // Default select all chapters initially
      const chapters = Array.from(new Set(allQs.map(q => q.chapter)));
      setSelectedChapters(chapters);
      setIsLoading(false);
    }

    loadAllQuestions();
  }, []);

  // Filter bank questions based on user step selections
  const filteredBankQuestions = React.useMemo(() => {
    return questionsBank.filter(q => {
      const matchSubject = selectedSubjects.includes(q.subject);
      const matchChapter = selectedChapters.length === 0 || selectedChapters.includes(q.chapter);
      const matchType = selectedTypes.includes(q.type);
      return matchSubject && matchChapter && matchType;
    });
  }, [questionsBank, selectedSubjects, selectedChapters, selectedTypes]);

  // Generate question set randomly from filtered pool
  const generatePaper = () => {
    const pool = [...filteredBankQuestions];
    if (pool.length === 0) {
      alert('No questions match your current filters. Please adjust subjects/chapters or question types.');
      return;
    }

    const countToPick = targetCount === 'custom' ? customCount : targetCount;
    // Shuffle pool
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(countToPick, pool.length));
    
    setPaperQuestions(selected);
    setWizardStep(5); // Proceed to interactive review
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header (Hidden during print) */}
      <div className="no-print">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          questionCount={questionsBank.length}
          onOpenIngestionGuide={() => setIsIngestionGuideOpen(true)}
        />
      </div>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 no-print">
            <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono">Loading JEE Advanced Modular Question Repository...</p>
          </div>
        ) : activeTab === 'bank' ? (
          <QuestionBankBrowser
            questionsBank={questionsBank}
            onOpenIngestionGuide={() => setIsIngestionGuideOpen(true)}
          />
        ) : (
          <div>
            {/* Step Progress Stepper Bar (Explicitly Hidden during Print) */}
            <div className="no-print mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                {[
                  { step: 1, label: 'Metadata' },
                  { step: 2, label: 'Chapters' },
                  { step: 3, label: 'Types' },
                  { step: 4, label: 'Count & Mode' },
                  { step: 5, label: 'Review Paper' },
                  { step: 6, label: '2-Column A4 PDF' }
                ].map((s) => (
                  <div
                    key={s.step}
                    onClick={() => {
                      if (s.step < wizardStep || (s.step === 5 && paperQuestions.length > 0) || (s.step === 6 && paperQuestions.length > 0)) {
                        setWizardStep(s.step);
                      }
                    }}
                    className={`flex items-center gap-1.5 cursor-pointer transition-all ${
                      wizardStep === s.step
                        ? 'text-indigo-400 font-bold'
                        : wizardStep > s.step
                        ? 'text-emerald-400'
                        : 'text-slate-600'
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                      wizardStep === s.step
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : wizardStep > s.step
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}>
                      {s.step}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Steps */}
            {wizardStep === 1 && (
              <WizardStep1_Metadata
                metadata={metadata}
                setMetadata={setMetadata}
                onNext={() => setWizardStep(2)}
              />
            )}

            {wizardStep === 2 && (
              <WizardStep2_Chapters
                selectedSubjects={selectedSubjects}
                setSelectedSubjects={setSelectedSubjects}
                selectedChapters={selectedChapters}
                setSelectedChapters={setSelectedChapters}
                questionsBank={questionsBank}
                onNext={() => setWizardStep(3)}
                onPrev={() => setWizardStep(1)}
              />
            )}

            {wizardStep === 3 && (
              <WizardStep3_QuestionTypes
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                questionsBank={questionsBank}
                onNext={() => setWizardStep(4)}
                onPrev={() => setWizardStep(2)}
              />
            )}

            {wizardStep === 4 && (
              <WizardStep4_OutputConfig
                targetCount={targetCount}
                setTargetCount={setTargetCount}
                customCount={customCount}
                setCustomCount={setCustomCount}
                paperMode={paperMode}
                setPaperMode={setPaperMode}
                availableTotal={filteredBankQuestions.length}
                onGenerate={generatePaper}
                onPrev={() => setWizardStep(3)}
              />
            )}

            {wizardStep === 5 && (
              <WizardStep5_InteractivePaper
                paperQuestions={paperQuestions}
                setPaperQuestions={setPaperQuestions}
                questionsBank={questionsBank}
                onProceedToPrint={() => setWizardStep(6)}
                onBackToWizard={() => setWizardStep(4)}
              />
            )}

            {wizardStep === 6 && (
              <WizardStep6_JEE2ColumnPrintPDF
                metadata={metadata}
                paperQuestions={paperQuestions}
                paperMode={paperMode}
                onBackToEdit={() => setWizardStep(5)}
              />
            )}
          </div>
        )}

      </main>

      {/* Ingestion Guide Modal */}
      <IngestionGuideModal
        isOpen={isIngestionGuideOpen}
        onClose={() => setIsIngestionGuideOpen(false)}
      />

    </div>
  );
}
