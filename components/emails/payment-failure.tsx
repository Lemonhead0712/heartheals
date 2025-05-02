import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface PaymentFailureEmailProps {
  userName: string
  failureDate: string
  invoiceId: string
  amount: string
  failureReason: string
  paymentMethod?: string
  subscriptionPlan?: string
  appUrl: string
}

export default function PaymentFailureEmail({
  userName = "Valued User",
  failureDate = new Date().toLocaleDateString(),
  invoiceId = "inv_12345",
  amount = "$5.00",
  failureReason = "Your card was declined",
  paymentMethod = "Card ending in 4242",
  subscriptionPlan = "Premium",
  appUrl = "https://heartsheals.app",
}: PaymentFailureEmailProps) {
  const previewText = `Payment Failed - Action Required for Your HeartHeals ${subscriptionPlan} Subscription`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded bg-white p-5">
            <Section className="text-center">
              <Img
                src={`${appUrl}/images/heart-heals-logo.png`}
                width="120"
                height="120"
                alt="HeartHeals Logo"
                className="mx-auto"
              />
              <Heading className="text-2xl font-bold text-rose-600">Payment Failed</Heading>
              <Text className="text-lg text-gray-600">Action Required for Your HeartHeals Subscription</Text>
            </Section>
            <Hr className="border-gray-200" />
            <Section>
              <Text className="text-gray-700">Hello {userName},</Text>
              <Text className="text-gray-700">
                We were unable to process your payment for your HeartHeals {subscriptionPlan} subscription. To continue
                enjoying all the benefits of your subscription, please update your payment information.
              </Text>

              <Section className="my-8 rounded-lg bg-rose-50 p-5">
                <Text className="font-medium text-rose-700">Payment Failure Details:</Text>
                <Text className="text-sm text-gray-700">
                  <strong>Date:</strong> {failureDate}
                </Text>
                <Text className="text-sm text-gray-700">
                  <strong>Invoice ID:</strong> {invoiceId}
                </Text>
                <Text className="text-sm text-gray-700">
                  <strong>Amount:</strong> {amount}
                </Text>
                <Text className="text-sm text-gray-700">
                  <strong>Payment Method:</strong> {paymentMethod}
                </Text>
                <Text className="text-sm text-gray-700">
                  <strong>Reason:</strong> {failureReason}
                </Text>
              </Section>

              <Text className="text-gray-700">
                Your subscription benefits will remain active for now, but to prevent any interruption in service,
                please update your payment method as soon as possible.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  className="rounded bg-rose-600 px-6 py-3 text-center text-sm font-medium text-white no-underline"
                  href={`${appUrl}/subscription`}
                >
                  Update Payment Method
                </Button>
              </Section>

              <Text className="text-gray-700">
                If you need any assistance or have questions about your subscription, please don't hesitate to contact
                our support team.
              </Text>

              <Text className="text-gray-700">
                Thank you for being part of the HeartHeals community. We're here to support your emotional wellness
                journey.
              </Text>

              <Text className="text-gray-700">Warm regards,</Text>
              <Text className="text-gray-700">The HeartHeals Team</Text>
            </Section>
            <Hr className="border-gray-200" />
            <Section>
              <Text className="text-xs text-gray-500">
                © {new Date().getFullYear()} HeartHeals. All rights reserved.
              </Text>
              <Text className="text-xs text-gray-500">
                <Link href={`${appUrl}/terms`} className="text-rose-600 underline">
                  Terms of Service
                </Link>{" "}
                •{" "}
                <Link href={`${appUrl}/privacy`} className="text-rose-600 underline">
                  Privacy Policy
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
