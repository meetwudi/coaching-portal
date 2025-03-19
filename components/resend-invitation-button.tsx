"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateInvitationDates } from "@/app/actions/invitations"

interface ResendInvitationButtonProps {
  invitationId: string
  email: string
  token: string
}

export default function ResendInvitationButton({ invitationId, email, token }: ResendInvitationButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleResend = async () => {
    setIsLoading(true)

    try {
      // Generate invitation URL
      const inviteUrl = `${window.location.origin}/invite/${token}`

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

      // Update the invitation's created_at and expires_at dates
      const result = await updateInvitationDates(invitationId)

      if (!result.success) {
        throw new Error(result.error || "Failed to update invitation dates")
      }

      toast({
        title: "Invitation resent",
        description: `The invitation has been resent to ${email}`,
      })

      router.refresh()
    } catch (error: any) {
      console.error("Resend invitation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
      onClick={handleResend}
      disabled={isLoading}
    >
      <RefreshCw className="h-4 w-4 mr-1" />
      {isLoading ? "Resending..." : "Resend"}
    </Button>
  )
}

