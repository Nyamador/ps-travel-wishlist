"use client"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { useEffect, useState } from "react"

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const initialIsDark = storedTheme
      ? storedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches

    document.documentElement.classList.toggle("dark", initialIsDark)
    setIsDark(initialIsDark)
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
    setIsDark(newTheme === "dark")
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Globomantics Travel Wishlist</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleTheme}>
            Toggle theme
          </Button>
        </div>
      </header>

      <ul className="space-y-3">
        <p>No destinations yet</p>
      </ul>
    </div>
  )
}
