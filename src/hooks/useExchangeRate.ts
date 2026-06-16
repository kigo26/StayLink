import { useState, useEffect } from 'react';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Fetch real-time exchange rate using a public open API
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        const data = await response.json();
        if (data && data.rates && data.rates.KES) {
          setExchangeRate(data.rates.KES);
        } else {
          // Fallback to average rate if API doesn't have KES
          setExchangeRate(132.5);
        }
      } catch (err) {
        console.warn('Currency API failed, using fallback exchange rate.', err);
        setExchangeRate(132.5); // Fallback standard market rate in case of network issues
        setError('Failed to load real-time rate');
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 3600000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  return { exchangeRate, loading, error };
};
