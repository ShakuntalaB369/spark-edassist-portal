import React from 'react';
import { AssessmentProvider } from './context/AssessmentContext';
import { AppRoutes } from './routes/AppRoutes';
import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <AssessmentProvider>
      <AppRoutes />
    </AssessmentProvider>
  );
}
