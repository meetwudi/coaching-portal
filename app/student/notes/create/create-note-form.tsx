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
import { createNote } from "@/app/actions/notes"

interface CreateNoteFormProps {
  coachId?: string
}

export default function CreateNoteForm({ coachId }: CreateNoteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user ID from the server
      const response = await fetch("/api/auth/get-user", {
        method: "GET",
      })

      const userData = await response.json()

      if (!response.ok) {
        throw new Error(userData.error || "Failed to get user information")
      }

      const userId = userData.id

      // If no coach ID is provided, get the first admin
      let adminId = coachId
      if (!adminId) {
        const adminResponse = await fetch("/api/admin/get-first", {
          method: "GET",
        })

        const adminData = await adminResponse.json()

        if (!adminResponse.ok) {
          throw new Error(adminData.error || "No coach found to send the note to")
        }

        adminId = adminData.id
      }

      // Create note using server action - note that for student-created notes,
      // we're setting createdByStudent to true
      const result = await createNote(userId, adminId, title, content, true)

      if (!result.success) {
        throw new Error(result.error || "Failed to create note")
      }

      // Get coach email for notification
      const coachResponse = await fetch(`/api/admin/get-email?id=${adminId}`, {
        method: "GET",
      })

      const coachData = await coachResponse.json()

      if (!coachResponse.ok) {
        // Note was created but we couldn't get the coach email
        setError(
          "Note was created but we couldn't send an email notification to your coach because their email address is not available.",
        )
        toast({
          title: "Note created",
          description: "Your note was saved but we couldn't send an email notification to your coach.",
          variant: "default",
        })
        router.push("/student/notes")
        return
      }

      // Send email notification to coach
      try {
        const response = await fetch("/api/send-student-note-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: coachData.email,
            noteTitle: title,
            studentName: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Your Student",
            portalUrl: `${window.location.origin}/admin/notes`,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Email notification failed:", errorData)
          throw new Error(errorData.message || "Failed to send email notification")
        }

        toast({
          title: "Note sent",
          description: "Your note has been sent to your coach",
        })
      } catch (emailError: any) {
        console.error("Email sending error:", emailError)
        setError(`Note was created but we couldn't send an email notification to your coach: ${emailError.message}`)
        toast({
          title: "Note created",
          description: "Your note was saved but we couldn't send an email notification to your coach.",
          variant: "default",
        })
      }

      setTitle("")
      setContent("")
      router.push("/student/notes")
    } catch (error: any) {
      console.error("Add note error:", error)
      setError(error.message || "Failed to send note")
      toast({
        title: "Error",
        description: error.message || "Failed to send note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateNote} className="space-y-4">
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
          {isLoading ? "Sending..." : "Send Note"}
        </Button>
      </div>
    </form>
  )
}

