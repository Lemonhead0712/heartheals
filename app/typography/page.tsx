import { PageContainer } from "@/components/page-container"
import { TypographyShowcase } from "@/components/typography-showcase"
import { Heading1, Paragraph } from "@/components/typography"

export default function TypographyPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <Heading1 className="mb-4">Typography System</Heading1>
        <Paragraph className="mb-8">
          This page showcases the elegant typography system used throughout the HeartHeals application. The system pairs
          the sophisticated Playfair Display serif font for headings with the clean and modern Inter sans-serif font for
          body text.
        </Paragraph>
        <TypographyShowcase />
      </div>
    </PageContainer>
  )
}
