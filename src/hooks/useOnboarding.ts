import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useOnboarding = () => {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const hasCompletedSetupOnboarding = useAppStore((state) => state.hasCompletedSetupOnboarding);
  const completeSetupOnboarding = useAppStore((state) => state.completeSetupOnboarding);

  const handleCompleteOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleCompleteSetupOnboarding = useCallback(() => {
    completeSetupOnboarding();
  }, [completeSetupOnboarding]);

  return {
    hasCompletedOnboarding,
    completeOnboarding: handleCompleteOnboarding,
    hasCompletedSetupOnboarding,
    completeSetupOnboarding: handleCompleteSetupOnboarding,
  };
};
