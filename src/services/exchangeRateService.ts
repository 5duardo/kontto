// Exchange rate service to fetch real-time currency rates

const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export interface ExchangeRates {
  [key: string]: number;
}

// Comprehensive default fallback rates (most common currencies)
const DEFAULT_RATES: ExchangeRates = {
  // Base
  USD: 1,
  // Americas
  HNL: 24.5,
  MXN: 17.05,
  BRL: 5.25,
  ARS: 950,
  COP: 4200,
  PEN: 3.7,
  GTQ: 7.8,
  CRC: 500,
  PAB: 1,
  NIO: 36.5,
  DOP: 58,
  UYU: 42,
  BOB: 6.9,
  PYG: 7200,
  VES: 2000000,
  CAD: 1.35,
  // Europa
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.6,
  DKK: 6.85,
  PLN: 4,
  CZK: 24,
  HUF: 375,
  RON: 4.6,
  RUB: 98,
  TRY: 33,
  UAH: 40,
  // Asia
  CNY: 7.1,
  JPY: 150,
  KRW: 1300,
  INR: 83,
  IDR: 15500,
  THB: 35,
  MYR: 4.7,
  SGD: 1.35,
  HKD: 7.8,
  AUD: 1.5,
  NZD: 1.65,
  ZAR: 18,
  PHP: 56,
  VND: 24500,
  PKR: 278,
  BDT: 109,
  LKR: 333,
  // Medio Oriente
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.377,
  OMR: 0.385,
  JOD: 0.71,
  ILS: 3.65,
  EGP: 48,
  NGN: 1540,
  KES: 157,
  GHS: 14,
};

let cachedRates: ExchangeRates = DEFAULT_RATES;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 3600000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from API (USD as base - API default)
 * Obtiene tasas para TODAS las monedas soportadas por la API
 */
const fetchRatesFromAPI = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`${API_BASE_URL}/USD`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Extract rates from API - incluye USD como base (valor 1)
    if (data.rates) {
      // El API retorna tasas con respecto a USD
      const apiRates: ExchangeRates = {
        USD: 1, // USD es la base
        ...data.rates, // Todas las otras monedas soportadas por el API
      };

      cachedRates = apiRates;
      lastUpdateTime = Date.now();

      return apiRates;
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
 * Soporta cualquier par de monedas
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'USD'
): Promise<number> => {
  const rates = await getExchangeRates();

  // Si son la misma moneda, retorna el mismo monto
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Obtén las tasas (si no existen, usa 1 como fallback)
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convertir usando la fórmula: (amount / fromRate) * toRate
  // Esto convierte primero a USD (la base), luego a la moneda objetivo
  return (amount / fromRate) * toRate;
};

/**
 * Convert to USD (base de la API)
 */
export const convertToUSD = async (amount: number, currency: string): Promise<number> => {
  const rates = await getExchangeRates();
  const rate = rates[currency] || 1;
  return amount / rate;
};

/**
 * Función auxiliar síncrona para conversiones rápidas usando rates cacheados
 * No hace llamadas a API, solo usa el cache actual
 */
export const convertCurrencySync = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number => {
  // Si son la misma moneda, retorna el mismo monto
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Obtén las tasas (si no existen, usa 1 como fallback)
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convertir usando la fórmula: (amount / fromRate) * toRate
  return (amount / fromRate) * toRate;
};
