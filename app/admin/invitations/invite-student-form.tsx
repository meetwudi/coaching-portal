"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createInvitation } from "@/app/actions/invitations"

export default function InviteStudentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createInvitation(email)

      if (!result.success) {
        throw new Error(result.error || "Failed to create invitation")
      }

      // Generate invitation URL
      const inviteUrl = `${window.location.origin}/invite/${result.token}`

      // Send invitation email
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          inviteUrl,
          adminName: "Your Career Coach", // We'll get this from the server
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send invitation email")
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")
      router.refresh()
    } catch (error: any) {
      console.error("Invitation error:", error)

      // If the email was sent but there was another error, don't delete the invitation
      if (error.message.includes("Failed to send invitation email")) {
        toast({
          title: "Partial success",
          description:
            "Invitation created but email could not be sent. You may need to share the invitation link manually.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Student Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Invitation"}
      </Button>
    </form>
  )
}

