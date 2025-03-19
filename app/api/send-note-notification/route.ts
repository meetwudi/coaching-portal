import { NextResponse } from "next/server"
import { sendEmail, getNoteEmailHtml } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, noteTitle, adminName, portalUrl, isUpdate } = body

    // Log the received data for debugging
    console.log("Received note notification data:", body)

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
    const html = getNoteEmailHtml({
      noteTitle,
      adminName: adminName || "Your Career Coach",
      portalUrl,
      isUpdate: isUpdate || false,
    })

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: isUpdate ? `Note Updated: ${noteTitle}` : `New Note: ${noteTitle}`,
      html,
    })

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error: any) {
    console.error("Error sending note notification:", error)
    return NextResponse.json({ message: error.message || "Failed to send email" }, { status: 500 })
  }
}

