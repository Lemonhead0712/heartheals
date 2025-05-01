import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/layouts/page-header"
import { Section } from "@/components/layouts/section"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Terms of Service | HeartHeals",
  description: "Terms and conditions for using the HeartHeals platform.",
}

export default function TermsPage() {
  return (
    <PageContainer>
      <PageHeader title="Terms of Service" description="Please read these terms carefully before using our platform." />

      <Section>
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-pink max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the HeartHeals platform, website, and services (collectively, the "Services"), you
                agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not
                use our Services.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                HeartHeals provides tools for emotional wellness, including emotional logging, breathing exercises, and
                reflective practices. Our Services are designed to support emotional well-being but are not a substitute
                for professional medical advice, diagnosis, or treatment.
              </p>

              <h2>3. User Accounts</h2>
              <p>
                To access certain features of our Services, you may need to create an account. You are responsible for
                maintaining the confidentiality of your account information and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2>4. Privacy</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                personal information. By using our Services, you consent to the collection and use of information as
                detailed in our Privacy Policy.
              </p>

              <h2>5. User Content</h2>
              <p>
                You retain ownership of any content you submit through our Services. By submitting content, you grant
                HeartHeals a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your
                content for the purpose of providing and improving our Services.
              </p>

              <h2>6. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use our Services for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt our Services</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Collect user information without consent</li>
              </ul>

              <h2>7. Subscription and Payments</h2>
              <p>
                Some features of our Services may require a subscription. By subscribing, you agree to pay the fees as
                described at the time of purchase. Subscriptions automatically renew unless canceled before the renewal
                date. Refunds are provided in accordance with our Refund Policy.
              </p>

              <h2>8. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to our Services at our discretion, without
                notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third
                parties, or for any other reason.
              </p>

              <h2>9. Disclaimer of Warranties</h2>
              <p>
                Our Services are provided "as is" without warranties of any kind, either express or implied. We do not
                warrant that our Services will be uninterrupted, secure, or error-free.
              </p>

              <h2>10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, HeartHeals shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your use of or inability to use our Services.
              </p>

              <h2>11. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of significant changes by posting a notice on
                our website or sending you an email. Your continued use of our Services after such modifications
                constitutes your acceptance of the modified Terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without
                regard to its conflict of law provisions.
              </p>

              <h2>13. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at support@heartsheals.com.</p>

              <p className="text-sm text-muted-foreground mt-8">Last updated: May 1, 2025</p>
            </div>
          </CardContent>
        </Card>
      </Section>
    </PageContainer>
  )
}
