import { useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useProgress = (scores, eduContext) => {
  const { foundationalScore, appliedScore, collaborativeScore, reflectiveScore, history = [] } = scores;

  const totalMasteryScore = useMemo(() => {
    return analyticsService.getTotalMasteryScore(foundationalScore, appliedScore, collaborativeScore, reflectiveScore);
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore]);

  const anxietyIndex = useMemo(() => {
    return analyticsService.getAnxietyIndex(foundationalScore, appliedScore, collaborativeScore, reflectiveScore);
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore]);

  const contextAdvice = useMemo(() => {
    return analyticsService.getContextAdvice(eduContext);
  }, [eduContext]);

  const rippleNodes = useMemo(() => {
    return analyticsService.getRippleNodes(foundationalScore, appliedScore, collaborativeScore, reflectiveScore, history);
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore, history]);

  return {
    totalMasteryScore,
    anxietyIndex,
    contextAdvice,
    rippleNodes
  };
};
