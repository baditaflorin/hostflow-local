import { useEffect, useState } from 'react'

export function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can fail in private browsing. The app keeps the in-memory state.
  }
}

export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readJson(key, fallback))

  useEffect(() => {
    writeJson(key, value)
  }, [key, value])

  return [value, setValue] as const
}
