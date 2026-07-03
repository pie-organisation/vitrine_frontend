import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiResult<T> {
  data:    T | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

// Generic hook for GET requests with loading + error state.
// The fetcher function must be stable (defined outside the component or memoized).
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (mountedRef.current) setData(result)
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erreur inattendue')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
