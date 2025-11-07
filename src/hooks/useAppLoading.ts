import { useState, useCallback, useEffect } from 'react';

export const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // No custom fonts to load, mark as ready immediately
    setFontsLoaded(true);
  }, []);

  // Terminar loading cuando las fuentes estén cargadas
  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Mantener loader 2 segundos en el arranque
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    finishLoading,
  };
};

