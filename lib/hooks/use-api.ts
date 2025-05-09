// lib/hooks/use-api.ts
import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface ApiMutationResponse<T, P> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (params: P) => Promise<T | null>;
}

/**
 * Hook for fetching data from API endpoints
 */
export function useApi<T>(fetcher: () => Promise<T>): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook for mutation operations (create, update, delete)
 */
export function useApiMutation<T, P>(mutator: (params: P) => Promise<T>): ApiMutationResponse<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (params: P): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutator(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, execute };
}