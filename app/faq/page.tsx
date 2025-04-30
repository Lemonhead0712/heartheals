import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PageContainer } from "@/components/page-container"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FAQPage() {
  return (
    <PageContainer>
      <div className="container max-w-3xl px-4 py-6 md:py-12">
        <div className="mb-6 flex items-center">
          <Link
            href="/"
            className="mr-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 md:hidden"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight md:text-4xl">Frequently Asked Questions</h1>
        </div>

        <p className="mb-6 text-sm text-muted-foreground md:mb-8 md:text-base">
          Find answers to common questions about HeartsHeal and how to make the most of your healing journey.
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm md:text-base">What is HeartsHeal?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              HeartsHeal is a digital companion for emotional healing, designed to provide tools for mindful reflection,
              breathing exercises, emotional journaling, and guided thought exercises. It's a safe space for those
              navigating grief, heartache, and personal loss.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm md:text-base">Is my data private?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              Yes, your privacy is our priority. All your emotional logs, journal entries, and personal reflections are
              securely stored and not shared with third parties. You can use HeartsHeal with confidence that your
              healing journey remains private.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm md:text-base">How do I use the breathing tool?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              The breathing tool guides you through mindful breathing exercises. Simply navigate to the Breathe section,
              choose your preferred breathing pattern, and follow the on-screen instructions. You can customize the
              duration, breathing ratio, and audio cues to suit your needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm md:text-base">What are emotional logs?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              Emotional logs are a feature that allows you to track and reflect on your emotions throughout your day. By
              recording how you feel using our emoji-based system, you can gain insights into your emotional patterns
              over time, helping you better understand your healing journey.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-sm md:text-base">
              Do I need a subscription to use HeartsHeal?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              HeartsHeal offers both free and premium features. The core tools for breathing, basic emotional logging,
              and thought exercises are available to all users. Premium subscribers gain access to advanced analytics,
              extended history, personalized insights, and additional specialized tools for deeper healing work.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-sm md:text-base">Can HeartsHeal replace therapy?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              HeartsHeal is designed to complement, not replace, professional mental health support. While our tools can
              aid in self-reflection and mindfulness, we encourage users facing significant emotional challenges to also
              seek support from qualified mental health professionals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-sm md:text-base">How do I export my data?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              Premium users can export their emotional logs, journal entries, and progress reports from the settings
              section. This feature allows you to save your healing journey or share insights with trusted support
              people or healthcare providers if you choose.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-sm md:text-base">Is there a community feature?</AccordionTrigger>
            <AccordionContent className="text-sm md:text-base">
              We're currently developing a supportive community feature that will allow users to connect with others on
              similar healing journeys, while maintaining privacy and creating a safe, moderated environment. Stay tuned
              for updates on this upcoming feature.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  )
}
