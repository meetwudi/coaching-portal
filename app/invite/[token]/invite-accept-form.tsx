"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MailCheck } from "lucide-react"

interface InviteAcceptFormProps {
  token: string
  email: string
}

export default function InviteAcceptForm({ token, email }: InviteAcceptFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Check if email confirmation is required
      if (!data.emailVerified) {
        setShowConfirmationMessage(true)
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
        })
      } else {
        // Sign in the user if email confirmation is not required
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        })

        if (!loginResponse.ok) {
          const loginData = await loginResponse.json()
          throw new Error(loginData.error || "Failed to sign in")
        }

        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        })

        router.push("/student/dashboard")
      }
    } catch (error: any) {
      // Handle "Email not confirmed" error specifically
      if (error.message === "Email not confirmed") {
        setShowConfirmationMessage(true)
        toast({
          title: "Email verification required",
          description: "Please check your email to confirm your account",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmationMessage) {
    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <MailCheck className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Check your email</AlertTitle>
          <AlertDescription className="text-blue-700">
            We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to
            confirm your email address.
          </AlertDescription>
        </Alert>
        <div className="text-center text-sm text-gray-500">
          <p>Once confirmed, you can sign in to access your coaching portal.</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => {
              router.push("/")
            }}
          >
            Return to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleAcceptInvite} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}

