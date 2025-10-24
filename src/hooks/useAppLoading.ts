import { useState, useCallback, useEffect } from 'react';
import * as Font from 'expo-font';

export const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Neo Sans Std Regular': require('../../assets/fonts/Neo Sans Std Regular.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error loading fonts:', error);
        // Si hay error cargando fuentes, continuar de todas formas
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  // Terminar loading cuando las fuentes estén cargadas
  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200); // Pequeño delay para smooth transition
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
