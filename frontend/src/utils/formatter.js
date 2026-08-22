export const formatPercentage = (val) => {
  return `${Math.round(val)}%`;
};

export const formatScore = (secured, max) => {
  return `${Math.round(secured)} / ${max}`;
};
