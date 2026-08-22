import { useState, useCallback, useEffect } from 'react';
import { assessmentService } from '../services/assessmentService';

// Keys used for localStorage persistence
const STORAGE_KEYS = {
  SESSION: 'spark_session',
  THEME: 'theme',
};

// Serialize session state to localStorage
const saveSession = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(state));
  } catch (_) {}
};

// Deserialize session state from localStorage
const loadSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

// Clear session from localStorage (logout / reconfigure)
const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (_) {}
};

export const useAssessment = () => {
  // Restore persisted session on first mount
  const saved = loadSession();

  const [email, setEmail] = useState(saved?.email ?? "");
  const [isOtpVerified, setIsOtpVerified] = useState(saved?.isOtpVerified ?? false);
  const [hasSetup, setHasSetup] = useState(saved?.hasSetup ?? false);
  const [userName, setUserName] = useState(saved?.userName ?? "");
  const [ageGroup, setAgeGroup] = useState(saved?.ageGroup ?? "15-18");
  const [eduContext, setEduContext] = useState(saved?.eduContext ?? "finland");
  const [country, setCountry] = useState(saved?.country ?? { name: 'India', code: 'IN' });
  const [profileImage, setProfileImage] = useState(saved?.profileImage ?? '');

  const [foundationalScore, setFoundationalScore] = useState(saved?.foundationalScore ?? 0);
  const [appliedScore, setAppliedScore] = useState(saved?.appliedScore ?? 0);
  const [collaborativeScore, setCollaborativeScore] = useState(saved?.collaborativeScore ?? 0);
  const [reflectiveScore, setReflectiveScore] = useState(saved?.reflectiveScore ?? 0);

  const [activeTab, setActiveTab] = useState(saved?.activeTab ?? "");
  const [toastMessage, setToastMessage] = useState(null);

  // AI Generated Assessment States
  const [configuration, setConfiguration] = useState(saved?.configuration ?? null);
  const [questions, setQuestions] = useState(saved?.questions ?? []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(saved?.currentQuestionIndex ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(saved?.selectedAnswers ?? {});
  const [completed, setCompleted] = useState(saved?.completed ?? false);

  // Real-time verification states
  const [score, setScore] = useState(saved?.score ?? 0);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' | 'incorrect' | null
  const [answeredQuestions, setAnsweredQuestions] = useState(saved?.answeredQuestions ?? {}); // { idx: { correct: bool, selectedIndex: num } }

  // AI Final Performance Report states
  const [report, setReport] = useState(saved?.report ?? null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const [token, setToken] = useState(saved?.token ?? null);

  // Theme: persisted separately (not part of session)
  // Default is 'light' — only switches to 'dark' if the user explicitly chose it.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  });

  useEffect(() => {
    saveSession({
      email,
      isOtpVerified,
      hasSetup,
      userName,
      ageGroup,
      eduContext,
      country,
      profileImage,
      foundationalScore,
      appliedScore,
      collaborativeScore,
      reflectiveScore,
      activeTab,
      configuration,
      questions,
      currentQuestionIndex,
      selectedAnswers,
      completed,
      score,
      answeredQuestions,
      report,
      token,
    });
  }, [
    email, isOtpVerified, hasSetup, userName, ageGroup, eduContext, country, profileImage,
    foundationalScore, appliedScore, collaborativeScore, reflectiveScore, activeTab,
    configuration, questions, currentQuestionIndex, selectedAnswers, completed,
    score, answeredQuestions, report, token,
  ]);

  // Synchronize theme class on <html> and persist it
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const handleResetProfile = useCallback(() => {
    // Clear all session state and localStorage on reset
    clearSession();
    setHasSetup(false);
    setUserName("");
    setFoundationalScore(0);
    setAppliedScore(0);
    setCollaborativeScore(0);
    setReflectiveScore(0);
    setActiveTab("");
    setIsOtpVerified(false);
    setEmail("");
    setConfiguration(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setCompleted(false);
    setError(null);
    setScore(0);
    setAnswerStatus(null);
    setAnsweredQuestions({});
    setReport(null);
    setReportLoading(false);
    setReportError(null);
    setToken(null);
    triggerToast("Environment reconfigured.");
  }, [triggerToast]);

  // Generate Assessment from Backend AI API
  const generateAssessment = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const res = await assessmentService.generateAssessment(config);
      if (res.success && res.data?.questions?.length > 0) {
        setQuestions(res.data.questions);
        const actualConfig = res.data.configuration || config;
        setConfiguration(actualConfig);
        if (actualConfig.category) {
          setActiveTab(actualConfig.category.toLowerCase());
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setCompleted(false);
        setScore(0);
        setAnswerStatus(null);
        setAnsweredQuestions({});
        triggerToast("Assessment generated successfully!");
      } else {
        throw new Error("Empty questions returned");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to generate your assessment.");
      triggerToast("Unable to generate your assessment.", "error");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const selectAnswer = useCallback((optionIdx) => {
    if (completed) return;
    // If already verified, do not allow changing answer
    if (answeredQuestions[currentQuestionIndex] !== undefined) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIdx
    }));
  }, [completed, currentQuestionIndex, answeredQuestions]);

  // Submit Answer to Backend for secure verification
  const submitAnswer = useCallback(async () => {
    const selectedIdx = selectedAnswers[currentQuestionIndex];
    if (selectedIdx === undefined) return;

    const q = questions[currentQuestionIndex];
    const answerText = q.questionType === 'Short Answer' ? selectedIdx : q.options[selectedIdx];

    setLoading(true);
    try {
      const res = await assessmentService.verifyAnswer(q._id, answerText);
      if (res.success) {
        const isCorrect = res.data.correct;
        setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
          setScore(prev => prev + 1);
        }
        setAnsweredQuestions(prev => ({
          ...prev,
          [currentQuestionIndex]: {
            correct: isCorrect,
            selectedIndex: selectedIdx,
            correctAnswer: res.data.correctAnswer || '',
            explanation: res.data.explanation || '',
            references: res.data.references || []
          }
        }));
      } else {
        throw new Error("Verification API failed");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Unable to verify your answer.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentQuestionIndex, questions, selectedAnswers, triggerToast]);

  // Generate AI Performance Report & Save Completed Assessment
  const generateReport = useCallback(async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await assessmentService.generateAssessmentReport(questions, answeredQuestions, configuration);
      if (res.success && res.data) {
        setReport(res.data);
        
        // Save the full assessment in database associated with authenticated user
        await assessmentService.completeAssessment(
          questions,
          answeredQuestions,
          configuration,
          res.data.report
        );

        // Instantly refresh and set mastery metrics
        const masteryRes = await assessmentService.getMyMastery();
        if (masteryRes.success && masteryRes.data) {
          const { foundational, applied, collaborative, reflective } = masteryRes.data;
          setFoundationalScore(foundational * 0.40);
          setAppliedScore(applied * 0.30);
          setCollaborativeScore(collaborative * 0.20);
          setReflectiveScore(reflective * 0.10);
        }
        
        triggerToast("Assessment completed and saved to history!");
      } else {
        throw new Error(res.message || "Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      setReportError(err.response?.data?.message || "Unable to generate the performance report right now. Please try again.");
      triggerToast("Unable to generate the performance report right now.", "error");
    } finally {
      setReportLoading(false);
    }
  }, [questions, answeredQuestions, configuration, triggerToast, setFoundationalScore, setAppliedScore, setCollaborativeScore, setReflectiveScore]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerStatus(null); // Reset answer status for next question
    } else {
      // Calculate score relative to total questions
      const pct = score / questions.length;
      const cat = configuration?.category || 'Foundational';
      if (cat === 'Foundational') {
        setFoundationalScore(pct * 40);
      } else if (cat === 'Applied') {
        setAppliedScore(pct * 30);
      } else if (cat === 'Collaborative') {
        setCollaborativeScore(pct * 20);
      } else if (cat === 'Reflective') {
        setReflectiveScore(pct * 10);
      }

      setCompleted(true);
      triggerToast(`Assessment complete! Score: ${Math.round((pct * 100))}%`);
      
      // Trigger report generation automatically on completion
      generateReport();
    }
  }, [currentQuestionIndex, questions, score, configuration, setFoundationalScore, setAppliedScore, setCollaborativeScore, setReflectiveScore, triggerToast, generateReport]);

  const resetAssessment = useCallback(() => {
    setConfiguration(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setCompleted(false);
    setError(null);
    setScore(0);
    setAnswerStatus(null);
    setAnsweredQuestions({});
    setReport(null);
    setReportLoading(false);
    setReportError(null);
    setActiveTab("");
  }, []);

  return {
    email,
    setEmail,
    isOtpVerified,
    setIsOtpVerified,
    hasSetup,
    setHasSetup,
    userName,
    setUserName,
    ageGroup,
    setAgeGroup,
    eduContext,
    setEduContext,
    country,
    setCountry,
    profileImage,
    setProfileImage,
    foundationalScore,
    setFoundationalScore,
    appliedScore,
    setAppliedScore,
    collaborativeScore,
    setCollaborativeScore,
    reflectiveScore,
    setReflectiveScore,
    activeTab,
    setActiveTab,
    toastMessage,
    triggerToast,
    handleResetProfile,
    theme,
    toggleTheme,

    // AI Generation states and helpers
    configuration,
    questions,
    currentQuestionIndex,
    loading,
    error,
    selectedAnswers,
    completed,
    generateAssessment,
    selectAnswer,
    nextQuestion,
    resetAssessment,

    // Real-time verification states and functions
    score,
    answerStatus,
    answeredQuestions,
    submitAnswer,

    // AI Report states and trigger
    report,
    reportLoading,
    reportError,
    generateReport,

    // Session token
    token,
    setToken,
  };
};
