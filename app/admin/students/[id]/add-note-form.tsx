"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createNote } from "@/app/actions/notes"

interface AddNoteFormProps {
  studentId: string
  studentEmail: string
}

export default function AddNoteForm({ studentId, studentEmail }: AddNoteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user ID from the server
      const response = await fetch("/api/auth/get-user", {
        method: "GET",
      })

      const userData = await response.json()

      if (!response.ok) {
        throw new Error(userData.error || "Failed to get user information")
      }

      const adminId = userData.id

      // Create note using server action
      const result = await createNote(studentId, adminId, title, content)

      if (!result.success) {
        throw new Error(result.error || "Failed to add note")
      }

      let emailSent = false

      // Only try to send email if we have a student email
      if (studentEmail) {
        try {
          const response = await fetch("/api/send-note-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: studentEmail,
              noteTitle: title,
              adminName: "Your Career Coach", // We'll get this from the server
              portalUrl: `${window.location.origin}/student/notes`,
            }),
          })

          if (response.ok) {
            emailSent = true
          } else {
            const errorData = await response.json()
            console.error("Email notification failed:", errorData)
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError)
        }
      }

      toast({
        title: "Note added",
        description: studentEmail
          ? emailSent
            ? "Your note has been shared with the student"
            : "Note added but email notification could not be sent"
          : "Note added (no email notification sent)",
        variant: emailSent || !studentEmail ? "default" : "destructive",
      })

      setTitle("")
      setContent("")
      router.refresh()
    } catch (error: any) {
      console.error("Add note error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleAddNote} className="space-y-4">
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Note"}
      </Button>
    </form>
  )
}

