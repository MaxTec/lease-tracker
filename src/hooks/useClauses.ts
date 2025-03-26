import { useState, useEffect } from 'react';

interface Clause {
  id: number;
  title: string;
  content: string;
  type: string;
}

export const useClauses = () => {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClauses = async () => {
      try {
        const response = await fetch('/api/clauses');
        if (!response.ok) {
          throw new Error('Failed to fetch clauses');
        }
        const data = await response.json();
        setClauses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClauses();
  }, []);

  return { clauses, isLoading, error };
}; 