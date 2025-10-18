import { useEffect, useState } from 'react';
import { getCachedRates, getExchangeRates } from '../services/exchangeRateService';

interface UseExchangeRatesReturn {
  rates: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage exchange rates with automatic updates
 * @param autoRefreshInterval - Interval in milliseconds to automatically refresh rates (default: 1 hour)
 */
export const useExchangeRates = (
  autoRefreshInterval: number = 3600000 // 1 hour
): UseExchangeRatesReturn => {
  const [rates, setRates] = useState<Record<string, number>>(getCachedRates());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newRates = await getExchangeRates();
      setRates(newRates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rates'));
      // Keep using cached rates on error
      setRates(getCachedRates());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    refresh();

    // Set up interval for auto-refresh
    const interval = setInterval(refresh, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  return { rates, isLoading, error, refresh };
};
