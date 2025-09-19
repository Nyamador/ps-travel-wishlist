"use client"
import Image from "next/image"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  addDestination,
  deleteDestination,
  getDestinations,
  setVisited,
  updateDestination,
  type Destination,
} from "@/lib/db"
import { useSessionFlag } from "@/hooks/use-session-flag"
import { useEffect, useState } from "react"

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [visitedOnly, setVisitedOnly] = useSessionFlag(
    "filter-visited-only",
    false
  )
  const [name, setName] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [items, setItems] = React.useState<Destination[]>([])
  const [editingId, setEditingId] = React.useState<number | null>(null)

  const refresh = React.useCallback(async () => {
    const data = await getDestinations()
    setItems(data)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

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

  const filtered = React.useMemo(
    () => (visitedOnly ? items.filter((i) => i.visited) : items),
    [items, visitedOnly]
  )

  async function handleAddOrUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (editingId) {
      const found = items.find((i) => i.id === editingId)
      if (found) {
        await updateDestination({
          ...found,
          name: name.trim(),
          notes: notes.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        })
        setEditingId(null)
      }
    } else {
      await addDestination(name, notes, imageUrl)
    }
    setName("")
    setNotes("")
    setImageUrl("")
    refresh()
  }

  async function handleDelete(id: number) {
    await deleteDestination(id)
    refresh()
  }

  async function handleToggleVisited(id: number, v: boolean) {
    await setVisited(id, v)
    refresh()
  }

  function startEdit(item: Destination) {
    setEditingId(item.id ?? null)
    setName(item.name)
    setNotes(item.notes ?? "")
    setImageUrl(item.imageUrl ?? "")
  }

  if (!mounted) return null

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Globomantics Travel Wishlist</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleTheme}>
            {isDark ? "Light" : "Dark"} mode
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={visitedOnly}
              onChange={(e) => setVisitedOnly(e.currentTarget.checked)}
            />
            Show visited only
          </label>
        </div>
      </header>

      <form onSubmit={handleAddOrUpdate} className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="name">Destination name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Kyoto"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            inputMode="url"
          />
          {imageUrl.trim() && (
            <div className="mt-1 rounded-md border overflow-hidden h-36 w-full bg-muted">
              {/* Use plain img to avoid Next image domain config for remote URLs */}
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Update" : "Add"}</Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null)
                setName("")
                setNotes("")
                setImageUrl("")
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-lg border overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                  <Image
                    src="/globe.svg"
                    alt="placeholder"
                    width={64}
                    height={64}
                  />
                </div>
              )}
              <input
                type="checkbox"
                title="Visited"
                className="absolute top-2 left-2 h-5 w-5"
                checked={item.visited}
                onChange={(e) =>
                  handleToggleVisited(item.id!, e.currentTarget.checked)
                }
              />
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="font-medium line-clamp-1">{item.name}</div>
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
                  onClick={() => startEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id!)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground col-span-full">
            No destinations yet.
          </div>
        )}
      </div>
    </div>
  )
}
