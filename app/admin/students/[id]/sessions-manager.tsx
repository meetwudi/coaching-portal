"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateSessions, createSessions } from "@/app/actions/sessions"

interface SessionsManagerProps {
  studentId: string
  initialSessions: {
    id?: string
    total_sessions: number
    used_sessions: number
  }
  needsSessionsRecord?: boolean
}

export default function SessionsManager({
  studentId,
  initialSessions,
  needsSessionsRecord = false,
}: SessionsManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [totalSessions, setTotalSessions] = useState(initialSessions.total_sessions)
  const [usedSessions, setUsedSessions] = useState(initialSessions.used_sessions)

  const handleUpdateSessions = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (initialSessions.id && !needsSessionsRecord) {
        // Update existing sessions record
        const result = await updateSessions(initialSessions.id, totalSessions, usedSessions)

        if (!result.success) {
          throw new Error(result.error || "Failed to update sessions")
        }

        toast({
          title: "Sessions updated",
          description: "The student's sessions have been updated successfully",
        })
      } else {
        // Create new sessions record
        const result = await createSessions(studentId, totalSessions, usedSessions)

        if (!result.success) {
          throw new Error(result.error || "Failed to create sessions")
        }

        toast({
          title: "Sessions created",
          description: "The student's sessions have been created successfully",
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateSessions} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="total-sessions">Total Sessions</Label>
        <Input
          id="total-sessions"
          type="number"
          min={0}
          value={totalSessions}
          onChange={(e) => setTotalSessions(Number.parseInt(e.target.value))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="used-sessions">Used Sessions</Label>
        <Input
          id="used-sessions"
          type="number"
          min={0}
          max={totalSessions}
          value={usedSessions}
          onChange={(e) => setUsedSessions(Number.parseInt(e.target.value))}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? needsSessionsRecord
            ? "Creating..."
            : "Updating..."
          : needsSessionsRecord
            ? "Create Sessions"
            : "Update Sessions"}
      </Button>
    </form>
  )
}

