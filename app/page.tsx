"use client"
import WishlistForm from "@/components/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import * as React from "react"
import { useEffect, useState } from "react"
import { useSessionFlag } from "@/hooks/use-session-flag"

export type Destination = {
  id?: number
  name: string
  notes?: string
  dateAdded: string
  visited?: boolean
  imageUrl?: string
}
export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [destinations, setDestinations] = useState<Array<Destination>>([])
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [visitedOnly, setVisitedOnly] = useSessionFlag(
    "filter-visited-only",
    false
  )

  useEffect(() => {
    const stored = localStorage.getItem("destinations")
    const loadedDestinations = stored ? JSON.parse(stored) : []
    setDestinations(loadedDestinations)
  }, [])

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const initialIsDark = storedTheme
      ? storedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches

    document.documentElement.classList.toggle("dark", initialIsDark)
    setIsDark(initialIsDark)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
    setIsDark(newTheme === "dark")
  }

  const filteredDestinations = React.useMemo(
    () => (visitedOnly ? destinations.filter((i) => i.visited) : destinations),
    [destinations, visitedOnly]
  )

  function saveDestinations(items: Destination[]) {
    localStorage.setItem("destinations", JSON.stringify(items))
  }

  async function addDestination(destination: Destination) {
    const newDestinations = [...destinations, destination]
    setDestinations(newDestinations)
    saveDestinations(newDestinations)
  }

  async function deleteDestination(id: number) {
    const newDestinations = destinations.filter((item) => item.id !== id)
    setDestinations(newDestinations)
    saveDestinations(newDestinations)
  }

  async function toggleVisited(id: number, visited: boolean) {
    const newDestinations = destinations.map((item) =>
      item.id === id ? { ...item, visited } : item
    )
    setDestinations(newDestinations)
    saveDestinations(newDestinations)
  }

  if (!mounted) return null

  return (
    <div className="max-w-3xl mx-auto w-full p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Globomantics Travel Wishlist</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleTheme}>
            Toggle theme
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={visitedOnly}
            onChange={(e) => setVisitedOnly(e.currentTarget.checked)}
          />
          Show visited only
        </label>
      </header>

      <WishlistForm onSubmit={addDestination} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDestinations.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border overflow-hidden ${
              item.visited
                ? "opacity-60 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : ""
            }`}
          >
            <div className="relative aspect-video bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className={`absolute inset-0 h-full w-full object-cover ${
                    item.visited ? "grayscale" : ""
                  }`}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                  <img
                    src="/globe.svg"
                    alt="placeholder"
                    width={64}
                    height={64}
                    className={item.visited ? "grayscale" : ""}
                  />
                </div>
              )}
              <input
                type="checkbox"
                title="Visited"
                className="absolute top-2 left-2 h-5 w-5"
                checked={item.visited}
                onChange={(e) =>
                  toggleVisited(item.id!, e.currentTarget.checked)
                }
              />
              {item.visited && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ✓ Visited
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div
                className={`font-medium line-clamp-1 ${
                  item.visited ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.name}
              </div>
              {item.notes && (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {item.notes}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Added {new Date(item.dateAdded).toLocaleString()}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(item.id!)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteDestination(item.id!)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <ul className="space-y-3">
          <p>No destinations yet</p>
        </ul>
      )}
    </div>
  )
}
