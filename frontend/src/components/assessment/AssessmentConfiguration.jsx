import React, { useState } from 'react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Sparkles, BookOpen } from 'lucide-react';
import questionsData from '../../data/questions.json';

export const AssessmentConfiguration = ({ onGenerate }) => {
  const { ageGroup: profileAgeGroup, eduContext: profileEduContext, loading, error, resetAssessment } = useAssessmentContext();

  // Map profile setup ageGroup to configuration options
  const getDefaultAgeGroup = () => {
    if (profileAgeGroup === '15-18') return '15–18';
    if (profileAgeGroup === '13-14' || profileAgeGroup === '10-12') return '11–14';
    return '';
  };

  // Map profile setup eduContext to configuration options
  const getDefaultGlobalContext = () => {
    const match = questionsData.EDU_CONTEXTS.find(c => c.id === profileEduContext);
    return match ? match.title : '';
  };

  const [config, setConfig] = useState({
    subject: '',
    ageGroup: getDefaultAgeGroup(),
    globalContext: getDefaultGlobalContext(),
    category: '',
    difficulty: '',
    bloomLevel: '',
    questionType: '',
    numberOfQuestions: 5,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectCountry = (title) => {
    handleChange('globalContext', title);
    setIsDropdownOpen(false);
  };

  const isFormValid = 
    config.subject &&
    config.ageGroup &&
    config.globalContext &&
    config.category &&
    config.difficulty &&
    config.bloomLevel &&
    config.questionType &&
    config.numberOfQuestions > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Log the complete configuration object to the console
    console.log('Assessment Configuration Object:', config);

    if (onGenerate) {
      onGenerate(config);
    }
  };

  const selectStyle = "bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-4 py-3 text-[14px] text-slate-900 dark:text-white w-full rounded-xl outline-none transition-all duration-200 focus:border-collaborative focus:bg-white dark:focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.25)] placeholder:text-slate-400 dark:placeholder:text-text-muted cursor-pointer";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Sparkles size={40} className="text-collaborative animate-spin" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white animate-pulse">Generating Your Assessment...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-xl">!</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Unable to generate your assessment.</h3>
        <p className="text-slate-500 dark:text-text-secondary text-[14.4px]">Please verify your server and API keys and try again.</p>
        <Button variant="pill-primary" onClick={resetAssessment} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-5 flex justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 mb-2">
            <BookOpen size={12} /> SPARK EdAssist Framework
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Assessment Generator</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Subject */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Subject *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubjectDropdownOpen(prev => !prev)}
                className={`${selectStyle} flex justify-between items-center text-left`}
              >
                <span>{config.subject || "Select Subject"}</span>
                <span className="text-[10px] opacity-75">▼</span>
              </button>
              
              {isSubjectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSubjectDropdownOpen(false)}></div>
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#121420] border border-slate-300 dark:border-panel-border rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto animate-fade-in">
                    <div 
                      onClick={() => { handleChange('subject', ""); setIsSubjectDropdownOpen(false); }}
                      className="px-4 py-2.5 text-[14px] cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    >
                      Select Subject
                    </div>
                    {questionsData.SUBJECTS.map(subj => (
                      <div
                        key={subj}
                        onClick={() => { handleChange('subject', subj); setIsSubjectDropdownOpen(false); }}
                        className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-900 dark:text-white ${config.subject === subj ? 'bg-collaborative/10 font-semibold' : ''}`}
                      >
                        {subj}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Age Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Age Group *</label>
            <select
              value={config.ageGroup}
              onChange={e => handleChange('ageGroup', e.target.value)}
              className={selectStyle}
            >
              <option value="" className="bg-white dark:bg-[#121420]">Select Age Group</option>
              <option value="6–10" className="bg-white dark:bg-[#121420]">6–10</option>
              <option value="11–14" className="bg-white dark:bg-[#121420]">11–14</option>
              <option value="15–18" className="bg-white dark:bg-[#121420]">15–18</option>
            </select>
          </div>

          {/* 3. Global Context */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Global Educational Context *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`${selectStyle} flex justify-between items-center text-left`}
              >
                <span>{config.globalContext || "Select Context"}</span>
                <span className="text-[10px] opacity-75">▼</span>
              </button>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#121420] border border-slate-300 dark:border-panel-border rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto animate-fade-in">
                    <div 
                      onClick={() => handleSelectCountry("")}
                      className="px-4 py-2.5 text-[14px] cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    >
                      Select Context
                    </div>
                    {questionsData.EDU_CONTEXTS.map(ctx => (
                      <div
                        key={ctx.id}
                        onClick={() => handleSelectCountry(ctx.title)}
                        className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-900 dark:text-white ${config.globalContext === ctx.title ? 'bg-collaborative/10 font-semibold' : ''}`}
                      >
                        {ctx.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4. Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Assessment Category *</label>
            <select
              value={config.category}
              onChange={e => handleChange('category', e.target.value)}
              className={selectStyle}
            >
              <option value="" className="bg-white dark:bg-[#121420]">Select Category</option>
              <option value="Foundational" className="bg-white dark:bg-[#121420]">Foundational</option>
              <option value="Applied" className="bg-white dark:bg-[#121420]">Applied</option>
              <option value="Collaborative" className="bg-white dark:bg-[#121420]">Collaborative</option>
              <option value="Reflective" className="bg-white dark:bg-[#121420]">Reflective</option>
            </select>
          </div>

          {/* 5. Difficulty */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Difficulty *</label>
            <select
              value={config.difficulty}
              onChange={e => handleChange('difficulty', e.target.value)}
              className={selectStyle}
            >
              <option value="" className="bg-white dark:bg-[#121420]">Select Difficulty</option>
              <option value="Easy" className="bg-white dark:bg-[#121420]">Easy</option>
              <option value="Medium" className="bg-white dark:bg-[#121420]">Medium</option>
              <option value="Hard" className="bg-white dark:bg-[#121420]">Hard</option>
            </select>
          </div>

          {/* 6. Bloom's Taxonomy */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Bloom's Taxonomy *</label>
            <select
              value={config.bloomLevel}
              onChange={e => handleChange('bloomLevel', e.target.value)}
              className={selectStyle}
            >
              <option value="" className="bg-white dark:bg-[#121420]">Select Bloom Level</option>
              <option value="Remember" className="bg-white dark:bg-[#121420]">Remember</option>
              <option value="Understand" className="bg-white dark:bg-[#121420]">Understand</option>
              <option value="Apply" className="bg-white dark:bg-[#121420]">Apply</option>
              <option value="Analyze" className="bg-white dark:bg-[#121420]">Analyze</option>
              <option value="Evaluate" className="bg-white dark:bg-[#121420]">Evaluate</option>
              <option value="Create" className="bg-white dark:bg-[#121420]">Create</option>
            </select>
          </div>

          {/* 7. Question Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Question Type *</label>
            <select
              value={config.questionType}
              onChange={e => handleChange('questionType', e.target.value)}
              className={selectStyle}
            >
              <option value="" className="bg-white dark:bg-[#121420]">Select Type</option>
              <option value="MCQ" className="bg-white dark:bg-[#121420]">MCQ</option>
              <option value="True/False" className="bg-white dark:bg-[#121420]">True/False</option>
              <option value="Short Answer" className="bg-white dark:bg-[#121420]">Short Answer</option>
            </select>
          </div>

          {/* 8. Number of Questions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em]">Number of Questions *</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={config.numberOfQuestions}
              onChange={e => handleChange('numberOfQuestions', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-panel-border pt-5 mt-4">
          <Button 
            type="submit"
            variant="pill-primary"
            disabled={!isFormValid}
            style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            <span>Generate Assessment</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
export default AssessmentConfiguration;
