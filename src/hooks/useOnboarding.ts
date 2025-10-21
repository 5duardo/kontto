import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useOnboarding = () => {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const handleCompleteOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    hasCompletedOnboarding,
    completeOnboarding: handleCompleteOnboarding,
  };
};
