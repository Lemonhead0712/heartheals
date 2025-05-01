import { Resend } from "resend"
import { renderAsync } from "@react-email/render"
import SubscriptionConfirmationEmail from "@/components/emails/subscription-confirmation"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Function to send subscription confirmation email
export async function sendSubscriptionConfirmationEmail({
  email,
  userName,
  subscriptionPlan = "Premium",
  amount = "$5.00",
}: {
  email: string
  userName: string
  subscriptionPlan?: string
  amount?: string
}) {
  try {
    const subscriptionDate = new Date().toLocaleDateString()
    const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heartsheals.app"

    // Create the email component with props
    const emailComponent = SubscriptionConfirmationEmail({
      userName,
      subscriptionDate,
      subscriptionPlan,
      amount,
      nextBillingDate,
      appUrl,
    })

    // Render the React component to HTML
    const html = await renderAsync(emailComponent)

    // IMPORTANT: Use Resend's verified domain for the sender address
    // In Resend's free tier, you can only send emails from verified domains or to verified email addresses
    const sender = "HeartHeals <onboarding@resend.dev>"

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV !== "production"

    // In development, log the email instead of sending it
    if (isDev) {
      console.log("📧 Development mode: Email would be sent with the following details:")
      console.log(`From: ${sender}`)
      console.log(`To: ${email}`)
      console.log(`Subject: Your HeartHeals ${subscriptionPlan} Subscription is Active!`)
      console.log("Email content preview:", html.substring(0, 200) + "...")

      return {
        success: true,
        data: { id: "dev-mode-email-id" },
        devMode: true,
      }
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: sender,
      to: email,
      subject: `Your HeartHeals ${subscriptionPlan} Subscription is Active!`,
      html: html,
    })

    if (error) {
      console.error("Error sending subscription confirmation email:", error)
      return {
        success: false,
        error,
        errorDetails:
          "If using Resend's free tier, you can only send emails to verified email addresses or from verified domains.",
      }
    }

    console.log("Subscription confirmation email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Exception sending subscription confirmation email:", error)
    return { success: false, error }
  }
}
