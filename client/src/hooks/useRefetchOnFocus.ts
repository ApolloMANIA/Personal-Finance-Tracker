import { useCallback, useEffect, useRef } from "react"

/**
 * Runs `fetcher` once on mount and again when the window regains focus.
 * No polling — keeps the UI fresh without constant re-renders.
 */
export function useRefetchOnFocus(fetcher: () => void | Promise<void>, enabled = true) {
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(() => {
    if (!enabled) return
    void fetcherRef.current()
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    run()

    const onFocus = () => run()
    const onVisibility = () => {
      if (document.visibilityState === "visible") run()
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled, run])
}
