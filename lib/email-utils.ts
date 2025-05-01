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

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "HeartHeals <notifications@heartsheals.app>",
      to: email,
      subject: `Your HeartHeals ${subscriptionPlan} Subscription is Active!`,
      html: html,
    })

    if (error) {
      console.error("Error sending subscription confirmation email:", error)
      return { success: false, error }
    }

    console.log("Subscription confirmation email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Exception sending subscription confirmation email:", error)
    return { success: false, error }
  }
}
