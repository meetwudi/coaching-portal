import { Resend } from "resend"

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email service using Resend
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    console.log(`Attempting to send email to ${to} with subject "${subject}"`)

    const { data, error } = await resend.emails.send({
      from: "Di Wu <noreply@meetwudi.com>", // You can customize this when you verify your domain with Resend
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("Error from Resend API:", error)
      throw new Error(`Resend API error: ${error.message}`)
    }

    console.log(`Email sent successfully to ${to}, ID: ${data?.id}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Failed to send email:", error)
    // Provide more context in the error message
    if (error.message.includes("RESEND_API_KEY")) {
      throw new Error("Email service configuration error: API key missing")
    } else if (error.response) {
      throw new Error(
        `Email service error (${error.response.status}): ${error.response.data?.message || error.message}`,
      )
    } else {
      throw new Error(`Email service error: ${error.message}`)
    }
  }
}

// Email template for invitations
export function getInvitationEmailHtml({
  inviteUrl,
  adminName,
}: {
  inviteUrl: string
  adminName: string
}) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>You've been invited to join the Career Coaching Portal</h2>
    <p>${adminName} has invited you to join their career coaching platform.</p>
    <p>Click the link below to create your account and get started:</p>
    <p>
      <a href="${inviteUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Accept Invitation
      </a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${inviteUrl}</p>
    <p>This invitation link will expire in 7 days.</p>
  </div>
`
}

// Update the getNoteEmailHtml function to handle note updates
export function getNoteEmailHtml({
  noteTitle,
  adminName,
  portalUrl,
  isUpdate = false,
}: {
  noteTitle: string
  adminName: string
  portalUrl: string
  isUpdate?: boolean
}) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>${isUpdate ? "Note updated by your career coach" : "New note from your career coach"}</h2>
    <p>${adminName} has ${isUpdate ? "updated a" : "shared a new"} note with you on the Career Coaching Portal.</p>
    <div style="border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <h3 style="margin-top: 0;">${noteTitle}</h3>
      <p style="color: #6b7280;">Click the button below to view this note in your coaching portal.</p>
    </div>
    <p>
      <a href="${portalUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Note
      </a>
    </p>
    <p>Or visit your coaching portal to view all notes.</p>
  </div>
`
}

// Update the getStudentNoteEmailHtml function to handle note updates
export function getStudentNoteEmailHtml({
  noteTitle,
  studentName,
  portalUrl,
  isUpdate = false,
}: {
  noteTitle: string
  studentName: string
  portalUrl: string
  isUpdate?: boolean
}) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>${isUpdate ? "Note updated by your student" : "New note from your student"}</h2>
    <p>${studentName} has ${isUpdate ? "updated a" : "shared a new"} note with you on the Career Coaching Portal.</p>
    <div style="border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <h3 style="margin-top: 0;">${noteTitle}</h3>
      <p style="color: #6b7280;">Click the button below to view this note in your coaching portal.</p>
    </div>
    <p>
      <a href="${portalUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Note
      </a>
    </p>
    <p>Or visit your coaching portal to view all notes.</p>
  </div>
`
}

