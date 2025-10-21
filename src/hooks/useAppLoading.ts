import { useState, useCallback } from 'react';

export const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    finishLoading,
  };
};
