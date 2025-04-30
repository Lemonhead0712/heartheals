import { PageContainer } from "@/components/page-container"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
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
          <h1 className="text-2xl font-bold tracking-tight md:text-4xl">About HeartsHeal♥</h1>
        </div>

        <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
          <p className="text-base md:text-lg">
            HeartsHeal was born from a simple but powerful idea: that emotional healing deserves its own gentle space —
            a place without pressure, without judgment, and filled with hope.
          </p>

          <p>
            Designed for those navigating grief, heartache, and personal loss, HeartsHeal offers tools for mindful
            reflection, breathing, emotional journaling, and guided thought exercises. Every feature was crafted with
            intention, helping users move forward one breath, one thought, one moment at a time.
          </p>

          <h2 className="mt-8 text-xl font-bold md:text-2xl">Our Mission</h2>
          <p>
            Our mission is to provide a peaceful, supportive space where healing can unfold naturally. We believe
            emotional recovery is not a destination, but a journey — a journey that honors every feeling and encourages
            growth through patience, awareness, and kindness.
          </p>

          <p>
            Through HeartsHeal, we aim to empower users to slow down, listen inward, and find resilience even in their
            most difficult moments.
          </p>

          <h2 className="mt-8 text-xl font-bold md:text-2xl">About the Creator</h2>
          <p>HeartsHeal was envisioned, designed, and developed by Lamar Newsome.</p>

          <p>
            Driven by personal experiences with grief, emotional loss, and the search for meaning after hardship, Lamar
            wanted to create more than just an app — they wanted to create a companion for healing.
          </p>

          <p>
            As the developer and emotional architect behind HeartsHeal, Lamar personally guided every step of its
            creation:
          </p>

          <ul className="list-disc pl-6">
            <li>Designing the overall user experience (UX) to be intuitive, calming, and non-intrusive</li>
            <li>Selecting soft, gentle color palettes to reflect emotional safety</li>
            <li>Crafting breathing exercises that mirror natural human rhythms</li>
            <li>Building emotional state logging tools to encourage healthy reflection without overwhelm</li>
            <li>Writing positive affirmations and reflection prompts to gently guide users toward hope</li>
          </ul>

          <p>
            HeartsHeal reflects both a technical effort and a deep emotional purpose: to make healing more accessible,
            one mindful moment at a time.
          </p>

          <h2 className="mt-8 text-xl font-bold md:text-2xl">Thank You for Being Here</h2>
          <p>
            Whether you're just beginning your healing journey or are seeking new ways to stay connected to your
            emotional wellness, HeartsHeal is here to walk beside you.
          </p>

          <p>
            Thank you for trusting HeartsHeal with a piece of your path. You are not alone. Healing is always possible —
            one breath, one thought, one step at a time.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
