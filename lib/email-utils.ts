import { Resend } from "resend"
import { renderAsync } from "@react-email/render"
import SubscriptionConfirmationEmail from "@/components/emails/subscription-confirmation"
import PaymentReceiptEmail from "@/components/emails/payment-receipt"
import PaymentFailureEmail from "@/components/emails/payment-failure"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Function to send subscription confirmation email
export async function sendSubscriptionConfirmationEmail({
  email,
  userName,
  subscriptionPlan = "Premium",
  amount = "$5.00",
  subscriptionId,
  startDate,
  endDate,
}: {
  email: string
  userName: string
  subscriptionPlan?: string
  amount?: string
  subscriptionId?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const subscriptionDate = startDate || new Date().toLocaleDateString()
    const nextBillingDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
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

// Function to send payment receipt email
export async function sendPaymentReceiptEmail({
  email,
  userName,
  paymentDate = new Date().toLocaleDateString(),
  invoiceId,
  amount = "$5.00",
  paymentMethod = "Card",
  subscriptionPlan = "Premium",
  nextBillingDate,
}: {
  email: string
  userName: string
  paymentDate?: string
  invoiceId: string
  amount?: string
  paymentMethod?: string
  subscriptionPlan?: string
  nextBillingDate?: string
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heartsheals.app"
    const nextBillingDateFormatted =
      nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()

    // Create the email component with props
    const emailComponent = PaymentReceiptEmail({
      userName,
      paymentDate,
      invoiceId,
      amount,
      paymentMethod,
      subscriptionPlan,
      nextBillingDate: nextBillingDateFormatted,
      appUrl,
    })

    // Render the React component to HTML
    const html = await renderAsync(emailComponent)

    // Use Resend's verified domain for the sender address
    const sender = "HeartHeals <onboarding@resend.dev>"

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV !== "production"

    // In development, log the email instead of sending it
    if (isDev) {
      console.log("📧 Development mode: Payment receipt email would be sent with the following details:")
      console.log(`From: ${sender}`)
      console.log(`To: ${email}`)
      console.log(`Subject: HeartHeals Payment Receipt - Thank you for your payment`)
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
      subject: `HeartHeals Payment Receipt - Thank you for your payment`,
      html: html,
    })

    if (error) {
      console.error("Error sending payment receipt email:", error)
      return {
        success: false,
        error,
        errorDetails:
          "If using Resend's free tier, you can only send emails to verified email addresses or from verified domains.",
      }
    }

    console.log("Payment receipt email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Exception sending payment receipt email:", error)
    return { success: false, error }
  }
}

// Function to send payment failure email
export async function sendPaymentFailureEmail({
  email,
  userName,
  failureDate = new Date().toLocaleDateString(),
  invoiceId,
  amount = "$5.00",
  failureReason = "Your card was declined",
  paymentMethod = "Card",
  subscriptionPlan = "Premium",
}: {
  email: string
  userName: string
  failureDate?: string
  invoiceId: string
  amount?: string
  failureReason?: string
  paymentMethod?: string
  subscriptionPlan?: string
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://heartsheals.app"

    // Create the email component with props
    const emailComponent = PaymentFailureEmail({
      userName,
      failureDate,
      invoiceId,
      amount,
      failureReason,
      paymentMethod,
      subscriptionPlan,
      appUrl,
    })

    // Render the React component to HTML
    const html = await renderAsync(emailComponent)

    // Use Resend's verified domain for the sender address
    const sender = "HeartHeals <onboarding@resend.dev>"

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV !== "production"

    // In development, log the email instead of sending it
    if (isDev) {
      console.log("📧 Development mode: Payment failure email would be sent with the following details:")
      console.log(`From: ${sender}`)
      console.log(`To: ${email}`)
      console.log(`Subject: HeartHeals Payment Failed - Action Required`)
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
      subject: `HeartHeals Payment Failed - Action Required`,
      html: html,
    })

    if (error) {
      console.error("Error sending payment failure email:", error)
      return {
        success: false,
        error,
        errorDetails:
          "If using Resend's free tier, you can only send emails to verified email addresses or from verified domains.",
      }
    }

    console.log("Payment failure email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Exception sending payment failure email:", error)
    return { success: false, error }
  }
}

// Add this function to safely log email configuration without exposing env vars to client
export function getEmailServiceConfiguration() {
  // This should only be called server-side
  if (typeof window !== "undefined") {
    console.error("getEmailServiceConfiguration should only be called server-side")
    return {
      configured: false,
      environment: "unknown",
      appUrl: "",
    }
  }

  return {
    apiKeyConfigured: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 5)}...` : "not-configured",
    environment: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  }
}
