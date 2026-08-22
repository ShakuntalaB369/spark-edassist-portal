import { createContext, useContext } from 'react';
import { useAssessment } from '../hooks/useAssessment';

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const assessment = useAssessment();
  return (
    <AssessmentContext.Provider value={assessment}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessmentContext = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessmentContext must be used within an AssessmentProvider');
  }
  return context;
};
