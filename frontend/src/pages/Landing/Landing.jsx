import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { Loader } from '../../components/ui/Loader';

export const Landing = () => {
  const { isOtpVerified, hasSetup } = useAssessmentContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOtpVerified) {
      navigate('/login', { replace: true });
    } else if (!hasSetup) {
      navigate('/setup', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isOtpVerified, hasSetup, navigate]);

  return <Loader />;
};
export default Landing;
