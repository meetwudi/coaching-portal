import { NextResponse } from "next/server"
import { sendEmail, getStudentNoteEmailHtml } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, noteTitle, studentName, portalUrl, isUpdate } = body

    // Log the received data for debugging
    console.log("Received student note notification data:", body)

    // Validate required fields with better error messages
    if (!email) {
      return NextResponse.json({ message: "Missing required field: email" }, { status: 400 })
    }

    if (!noteTitle) {
      return NextResponse.json({ message: "Missing required field: noteTitle" }, { status: 400 })
    }

    if (!portalUrl) {
      return NextResponse.json({ message: "Missing required field: portalUrl" }, { status: 400 })
    }

    // Generate email HTML
    const html = getStudentNoteEmailHtml({
      noteTitle,
      studentName: studentName || "Your Student",
      portalUrl,
      isUpdate: isUpdate || false,
    })

    // Send the email
    try {
      const result = await sendEmail({
        to: email,
        subject: isUpdate ? `Student Note Updated: ${noteTitle}` : `New Note from Student: ${noteTitle}`,
        html,
      })

      return NextResponse.json({ success: true, messageId: result.data?.id })
    } catch (emailError: any) {
      console.error("Error in email sending service:", emailError)
      return NextResponse.json(
        {
          message: `Email service error: ${emailError.message}`,
          details: emailError.toString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error sending student note notification:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to send email",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

