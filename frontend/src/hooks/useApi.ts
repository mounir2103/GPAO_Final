
import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/types';
import { toast } from 'sonner';

// Hook générique pour les appels API
export function useApi<T, P = void>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour exécuter la requête API
  const execute = useCallback(async (apiCall: (params?: P) => Promise<ApiResponse<T>>, params?: P) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(params);
      
      if (response.success) {
        setData(response.data || null);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.error || response.message || 'Une erreur est survenue';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
}

export default useApi;
