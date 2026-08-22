export const getMasteryStatus = (score) => {
  if (score >= 90) return "Mastery";
  if (score >= 60) return "Proficient";
  return "Developing";
};

export const calculateMasteryWheelSegments = (radius = 90) => {
  const circ = 2 * Math.PI * radius;
  return {
    circ,
    segmentLengths: {
      foundational: circ * 0.4,
      applied: circ * 0.3,
      collaborative: circ * 0.2,
      reflective: circ * 0.1
    }
  };
};

export const calculateStrokeFills = (scores, segmentLengths) => {
  return {
    foundational: (scores.foundational / 40) * segmentLengths.foundational,
    applied: (scores.applied / 30) * segmentLengths.applied,
    collaborative: (scores.collaborative / 20) * segmentLengths.collaborative,
    reflective: (scores.reflective / 10) * segmentLengths.reflective
  };
};
