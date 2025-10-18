// Exchange rate service to fetch real-time currency rates

const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export interface ExchangeRates {
  [key: string]: number;
}

// Default fallback rates
const DEFAULT_RATES: ExchangeRates = {
  HNL: 1,
  USD: 24.5,
  EUR: 26.5,
};

let cachedRates: ExchangeRates = DEFAULT_RATES;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 3600000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from API (USD as base)
 */
const fetchRatesFromAPI = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`${API_BASE_URL}/USD`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract rates and convert to HNL base if needed
    if (data.rates) {
      // Get the rate to HNL (if USD to HNL exists)
      const usdToHNL = data.rates.HNL || DEFAULT_RATES.USD;
      
      // Create HNL-based rates
      const hnlRates: ExchangeRates = {
        HNL: 1,
        USD: usdToHNL,
        EUR: (data.rates.EUR || DEFAULT_RATES.EUR / DEFAULT_RATES.USD) * usdToHNL,
      };
      
      cachedRates = hnlRates;
      lastUpdateTime = Date.now();
      
      return hnlRates;
    }
    
    throw new Error('Invalid API response');
  } catch (error) {
    console.warn('Failed to fetch exchange rates from API:', error);
    return cachedRates;
  }
};

/**
 * Get current exchange rates with automatic update if needed
 */
export const getExchangeRates = async (): Promise<ExchangeRates> => {
  const now = Date.now();
  
  // Update rates if cache is older than UPDATE_INTERVAL
  if (now - lastUpdateTime > UPDATE_INTERVAL) {
    return await fetchRatesFromAPI();
  }
  
  return cachedRates;
};

/**
 * Force update exchange rates
 */
export const updateExchangeRates = async (): Promise<ExchangeRates> => {
  lastUpdateTime = 0; // Force update on next call
  return await fetchRatesFromAPI();
};

/**
 * Get cached rates without making API calls
 */
export const getCachedRates = (): ExchangeRates => {
  return cachedRates;
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'HNL'
): Promise<number> => {
  const rates = await getExchangeRates();
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert: amount * (1 / fromRate) * toRate
  return (amount / fromRate) * toRate;
};

/**
 * Convert to HNL (most common use case)
 */
export const convertToHNL = async (amount: number, currency: string): Promise<number> => {
  const rates = await getExchangeRates();
  const rate = rates[currency] || 1;
  return amount * rate;
};
