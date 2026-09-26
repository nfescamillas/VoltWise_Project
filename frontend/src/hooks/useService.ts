import { useEffect, useState } from 'react';

export function useService<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    loader().then((value) => active && setData(value)).catch((reason) => active && setError(reason instanceof Error ? reason : new Error(String(reason))));
    return () => { active = false; };
    // The caller owns dependency stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, error, loading: data === null && error === null };
}
