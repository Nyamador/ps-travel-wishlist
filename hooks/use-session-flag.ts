"use client"

import { useState, useEffect } from "react"

export function useSessionFlag(key: string, initial: boolean = false) {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === "undefined") return initial
    const raw = window.sessionStorage.getItem(key)
    return raw === null ? initial : raw === "true"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(key, value ? "true" : "false")
  }, [key, value])

  return [value, setValue] as const
}
