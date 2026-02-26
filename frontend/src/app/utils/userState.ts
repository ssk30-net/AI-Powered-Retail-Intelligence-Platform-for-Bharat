// User state management for onboarding flow

export const isFirstTimeUser = (): boolean => {
  const hasUploadedData = localStorage.getItem('hasUploadedData');
  return hasUploadedData !== 'true';
};

export const markUserAsReturning = (): void => {
  localStorage.setItem('hasUploadedData', 'true');
};

export const resetUserState = (): void => {
  localStorage.removeItem('hasUploadedData');
};
