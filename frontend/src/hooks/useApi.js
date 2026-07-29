import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Run an async service call and expose `{ data, error, loading, refetch }`.
 * Pass `immediate: false` to trigger it manually.
 */
export function useApi(fetcher, { immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(...args);
        if (mounted.current) setData(result);
        return result;
      } catch (err) {
        if (mounted.current) setError(err);
        throw err;
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [fetcher],
  );

  useEffect(() => {
    if (immediate) run().catch(() => {});
  }, [immediate, run]);

  return { data, error, loading, refetch: run };
}

export default useApi;
