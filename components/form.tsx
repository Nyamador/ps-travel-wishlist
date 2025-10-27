import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { useState } from "react"
import { Destination } from "@/app/page"

interface WishlistFormProps {
  onSubmit: (destination: Destination) => void
  editingId?: number
}
const WishlistForm = ({ onSubmit }: WishlistFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    imageUrl: "",
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          id: Date.now(),
          name: formData.name,
          notes: formData.notes,
          imageUrl: formData.imageUrl,
          dateAdded: new Date().toISOString(),
        })
        setFormData({
          name: "",
          notes: "",
          imageUrl: "",
        })
      }}
      className="space-y-3"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Destination name</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Kyoto"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl || ""}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://example.com/photo.jpg"
          inputMode="url"
        />
        {formData.imageUrl.trim() && (
          <div className="mt-1 rounded-md border overflow-hidden h-36 w-full bg-muted">
            {/* Use plain img to avoid Next image domain config for remote URLs */}
            <img
              src={formData.imageUrl}
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
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Add</Button>
      </div>
    </form>
  )
}

export default WishlistForm
