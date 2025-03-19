"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateNote } from "@/app/actions/notes"

interface EditNoteFormProps {
  note: {
    id: string
    title: string
    content: string
    admin_id: string
  }
}

export default function EditNoteForm({ note }: EditNoteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Update the note using server action
      const result = await updateNote(note.id, title, content)

      if (!result.success) {
        throw new Error(result.error || "Failed to update note")
      }

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully",
      })

      router.push("/student/notes")
      router.refresh()
    } catch (error: any) {
      console.error("Update note error:", error)
      setError(error.message || "Failed to update note")
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateNote} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={5}
          required
        />
      </div>
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Updating..." : "Update Note"}
        </Button>
      </div>
    </form>
  )
}

