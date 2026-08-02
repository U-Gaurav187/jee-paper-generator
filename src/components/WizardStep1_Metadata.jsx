import React from 'react';
import { BookOpen, School, Clock, Award, ShieldAlert, Layers } from 'lucide-react';

export default function WizardStep1_Metadata({ metadata, setMetadata, onNext }) {
  const handleChange = (field, val) => {
    setMetadata(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Step 1: Test & Institute Details
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Set up basic test header parameters for your JEE Advanced Question Paper.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Test Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Test Name / Title
            </label>
            <input
              type="text"
              value={metadata.testTitle}
              onChange={(e) => handleChange('testTitle', e.target.value)}
              placeholder="e.g. JEE Advanced Full Mock Test - 01"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden transition-all"
            />
          </div>

          {/* Institute Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <School className="h-3.5 w-3.5 text-purple-400" />
              Institute / Organization Name
            </label>
            <input
              type="text"
              value={metadata.instituteName}
              onChange={(e) => handleChange('instituteName', e.target.value)}
              placeholder="e.g. Apex IIT-JEE Academy"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden transition-all"
            />
          </div>

          {/* Target Exam Pattern */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-pink-400" />
              Target Exam Pattern
            </label>
            <select
              value={metadata.examPattern}
              onChange={(e) => handleChange('examPattern', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-hidden transition-all"
            >
              <option value="JEE Advanced Paper 1">JEE Advanced Paper 1 (54 Qs Standard)</option>
              <option value="JEE Advanced Paper 2">JEE Advanced Paper 2 (54 Qs Standard)</option>
              <option value="JEE Advanced Full Mock">JEE Advanced Full Mock (108 Qs Combined)</option>
              <option value="Custom Chapter Test">Custom Chapter Practice Test</option>
            </select>
          </div>

          {/* Standard / Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Class / Standard
            </label>
            <select
              value={metadata.standard}
              onChange={(e) => handleChange('standard', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-hidden transition-all"
            >
              <option value="11th Class">Class 11th</option>
              <option value="12th Class">Class 12th</option>
              <option value="Dropper / Repeater">Dropper / Repeater Batch</option>
              <option value="Combined (11th + 12th)">Combined (11th + 12th Full Syllabus)</option>
            </select>
          </div>

          {/* Time Allowed */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              Time Allowed (Minutes)
            </label>
            <input
              type="text"
              value={metadata.timeAllowed}
              onChange={(e) => handleChange('timeAllowed', e.target.value)}
              placeholder="e.g. 180 Minutes (3 Hours)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden transition-all"
            />
          </div>

          {/* Maximum Marks & Marking Scheme */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              Marking Scheme Rule
            </label>
            <select
              value={metadata.markingScheme}
              onChange={(e) => handleChange('markingScheme', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-hidden transition-all"
            >
              <option value="+3 / -1 for SCQ, +4 / -2 for MCQ, +3 / 0 for Numerical">Standard JEE Advanced (+4/-2 MCQ, +3/-1 SCQ)</option>
              <option value="+4 for Correct, -1 for Incorrect, 0 Unanswered">Standard +4 / -1 Marking</option>
              <option value="No Negative Marking (+4 / 0)">No Negative Marking (+4 / 0)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Continue to Step 2: Select Chapters →
          </button>
        </div>
      </div>
    </div>
  );
}
