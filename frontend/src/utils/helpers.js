export const triggerToastHelper = (msg, setToastMessage) => {
  setToastMessage(msg);
  const timer = setTimeout(() => {
    setToastMessage(null);
  }, 3500);
  return timer;
};

export const getAgeGroupTitle = (ageGroups, id) => {
  return ageGroups.find(a => a.id === id)?.title || '';
};

export const getEduContextTitle = (eduContexts, id) => {
  return eduContexts.find(c => c.id === id)?.title || '';
};
