import { NextResponse } from "next/server"
import { sendEmail, getInvitationEmailHtml } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, inviteUrl, adminName } = await request.json()

    if (!email || !inviteUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate email HTML
    const html = getInvitationEmailHtml({
      inviteUrl,
      adminName: adminName || "Your Career Coach",
    })

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Invitation to Career Coaching Portal",
      html,
    })

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error: any) {
    console.error("Error sending invitation email:", error)
    return NextResponse.json({ message: error.message || "Failed to send email" }, { status: 500 })
  }
}

