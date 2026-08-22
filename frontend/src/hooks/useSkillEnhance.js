import { useState, useCallback } from 'react';
import skillEnhanceService from '../services/skillEnhanceService';

export const useSkillEnhance = (triggerToast) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' | 'incorrect' | null
  const [startTime, setStartTime] = useState(null);

  const startSkillEnhance = useCallback(async (ageGroup, difficulty) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setScore(0);
    setSessionComplete(false);
    setSessionResult(null);
    setAnswerStatus(null);
    
    try {
      const res = await skillEnhanceService.generateSkillEnhance(ageGroup, difficulty);
      if (res.success && res.data) {
        setQuestions(res.data.questions);
        setStartTime(Date.now());
        triggerToast("Skill Enhance session started!");
      } else {
        throw new Error(res.message || "Failed to start Skill Enhance");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load Skill Enhance session.");
      triggerToast("Unable to start Skill Enhance.", "error");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleSelectAnswer = useCallback((val) => {
    if (answeredQuestions[currentQuestionIndex] !== undefined) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: val
    }));
  }, [currentQuestionIndex, answeredQuestions]);

  const submitAnswer = useCallback(() => {
    const selectedIdx = selectedAnswers[currentQuestionIndex];
    if (selectedIdx === undefined) return;

    const q = questions[currentQuestionIndex];
    const isShortAns = q.questionType === 'Short Answer';
    
    let isCorrect = false;
    let selectedText = '';
    
    if (isShortAns) {
      selectedText = selectedIdx.trim();
      isCorrect = selectedText.toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
    } else {
      selectedText = q.options[selectedIdx];
      isCorrect = selectedText === q.correctAnswer;
    }

    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        isCorrect,
        selectedAnswer: selectedText
      }
    }));
  }, [currentQuestionIndex, questions, selectedAnswers]);

  const nextQuestion = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerStatus(null);
    } else {
      // Complete Skill Enhance
      setLoading(true);
      try {
        const answersList = questions.map((q, idx) => ({
          questionId: q.id || `q-${idx}`,
          selectedAnswer: answeredQuestions[idx]?.selectedAnswer || '',
          isCorrect: !!answeredQuestions[idx]?.isCorrect
        }));

        const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        const res = await skillEnhanceService.completeSkillEnhance(questions, answersList, timeTaken);
        if (res.success && res.data) {
          setSessionResult(res.data);
          setSessionComplete(true);
          triggerToast("Skill Enhance session completed!");
        } else {
          throw new Error("Failed to complete Skill Enhance");
        }
      } catch (err) {
        console.error(err);
        triggerToast("Unable to save completion data.", "error");
      } finally {
        setLoading(false);
      }
    }
  }, [currentQuestionIndex, questions, answeredQuestions, startTime, triggerToast]);

  const resetSession = useCallback(() => {
    setQuestions([]);
    setSessionComplete(false);
    setSessionResult(null);
  }, []);

  return {
    questions,
    currentQuestionIndex,
    selectedAnswers,
    answeredQuestions,
    score,
    sessionComplete,
    sessionResult,
    loading,
    error,
    answerStatus,
    startSkillEnhance,
    handleSelectAnswer,
    submitAnswer,
    nextQuestion,
    resetSession
  };
};

export default useSkillEnhance;
