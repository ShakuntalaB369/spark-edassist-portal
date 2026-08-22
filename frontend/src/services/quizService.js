import questionsData from '../data/questions.json';

export const quizService = {
  getQuestions(ageGroup) {
    return questionsData.QUIZ_QUESTIONS[ageGroup] || [];
  },
  
  calculateScore(selectedAnswers, ageGroup) {
    const questions = this.getQuestions(ageGroup);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    return questions.length > 0 ? (correctCount / questions.length) * 40 : 0;
  }
};
