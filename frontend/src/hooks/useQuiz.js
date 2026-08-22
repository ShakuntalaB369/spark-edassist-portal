import { useState, useCallback } from 'react';
import { quizService } from '../services/quizService';

export const useQuiz = (ageGroup, setFoundationalScore, triggerToast) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizLocked, setQuizLocked] = useState(false);

  const handleSelectQuizAnswer = useCallback((optionIdx) => {
    if (quizLocked) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: optionIdx
    }));
  }, [quizLocked, currentQuizIndex]);

  const handleNextQuizQuestion = useCallback(() => {
    const questions = quizService.getQuestions(ageGroup);
    if (currentQuizIndex < questions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      const finalVal = quizService.calculateScore(selectedAnswers, ageGroup);
      setFoundationalScore(finalVal);
      setQuizLocked(true);
      triggerToast(`Conceptual Quiz complete! Foundational score: ${Math.round(finalVal)}% of 40%`);
    }
  }, [currentQuizIndex, ageGroup, selectedAnswers, setFoundationalScore, triggerToast]);

  const resetQuiz = useCallback(() => {
    setCurrentQuizIndex(0);
    setSelectedAnswers({});
    setQuizLocked(false);
  }, []);

  return {
    currentQuizIndex,
    selectedAnswers,
    quizLocked,
    handleSelectQuizAnswer,
    handleNextQuizQuestion,
    resetQuiz
  };
};
