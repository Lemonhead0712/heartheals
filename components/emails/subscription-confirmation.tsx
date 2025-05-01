import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface SubscriptionConfirmationEmailProps {
  userName: string
  subscriptionDate: string
  subscriptionPlan: string
  amount: string
  nextBillingDate: string
  appUrl: string
}

export default function SubscriptionConfirmationEmail({
  userName = "Valued User",
  subscriptionDate = new Date().toLocaleDateString(),
  subscriptionPlan = "Premium",
  amount = "$5.00",
  nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  appUrl = "https://heartsheals.app",
}: SubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your HeartHeals {subscriptionPlan} subscription is now active!</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img
              src={`${appUrl}/images/heart-heals-logo.png`}
              alt="HeartHeals Logo"
              width="120"
              height="50"
              style={logoStyle}
            />
          </Section>
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Welcome to HeartHeals {subscriptionPlan}!</Heading>
            <Text style={paragraphStyle}>Hello {userName},</Text>
            <Text style={paragraphStyle}>
              Thank you for subscribing to HeartHeals {subscriptionPlan}! Your subscription is now active, and you have
              full access to all our premium features.
            </Text>
            <Section style={detailsContainerStyle}>
              <Text style={detailHeadingStyle}>Subscription Details:</Text>
              <Text style={detailStyle}>
                <strong>Plan:</strong> {subscriptionPlan}
              </Text>
              <Text style={detailStyle}>
                <strong>Amount:</strong> {amount} / month
              </Text>
              <Text style={detailStyle}>
                <strong>Start Date:</strong> {subscriptionDate}
              </Text>
              <Text style={detailStyle}>
                <strong>Next Billing Date:</strong> {nextBillingDate}
              </Text>
            </Section>
            <Text style={paragraphStyle}>
              You now have access to all premium features including advanced analytics, personalized insights, and more.
            </Text>
            <Section style={buttonContainerStyle}>
              <Link href={appUrl} style={buttonStyle}>
                Start Exploring
              </Link>
            </Section>
            <Text style={paragraphStyle}>
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </Text>
            <Text style={paragraphStyle}>Thank you for choosing HeartHeals for your emotional wellness journey!</Text>
            <Text style={signatureStyle}>
              Warmly,
              <br />
              The HeartHeals Team
            </Text>
          </Section>
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>© {new Date().getFullYear()} HeartHeals. All rights reserved.</Text>
            <Text style={footerTextStyle}>
              <Link href={`${appUrl}/privacy`} style={footerLinkStyle}>
                Privacy Policy
              </Link>{" "}
              |
              <Link href={`${appUrl}/terms`} style={footerLinkStyle}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
}

const headerStyle = {
  backgroundColor: "#ffffff",
  padding: "20px 0",
  textAlign: "center" as const,
  borderBottom: "1px solid #e6ebf1",
}

const logoStyle = {
  margin: "0 auto",
}

const contentStyle = {
  padding: "40px 30px",
}

const headingStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#6b46c1", // Purple color
  margin: "0 0 20px",
  textAlign: "center" as const,
}

const paragraphStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "0 0 20px",
}

const detailsContainerStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "8px",
  margin: "30px 0",
}

const detailHeadingStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#4a5568",
  margin: "0 0 15px",
}

const detailStyle = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#4a5568",
  margin: "0 0 10px",
}

const buttonContainerStyle = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const buttonStyle = {
  backgroundColor: "#6b46c1",
  color: "#ffffff",
  padding: "12px 30px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "4px",
  textDecoration: "none",
  display: "inline-block",
}

const signatureStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "30px 0 0",
}

const footerStyle = {
  backgroundColor: "#f9fafb",
  padding: "20px 30px",
  textAlign: "center" as const,
  borderTop: "1px solid #e6ebf1",
}

const footerTextStyle = {
  fontSize: "14px",
  color: "#718096",
  margin: "5px 0",
}

const footerLinkStyle = {
  color: "#6b46c1",
  textDecoration: "none",
  margin: "0 5px",
}
