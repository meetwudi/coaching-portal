"use client"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

interface EditNoteButtonProps {
  noteId: string
  isAdmin: boolean
}

export default function EditNoteButton({ noteId, isAdmin }: EditNoteButtonProps) {
  const basePath = isAdmin ? "/admin" : "/student"

  return (
    <Link href={`${basePath}/notes/edit/${noteId}`}>
      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
    </Link>
  )
}

