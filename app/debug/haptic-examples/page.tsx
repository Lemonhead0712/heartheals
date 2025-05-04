import { PageContainer } from "@/components/page-container"
import { HapticUsageExample } from "@/components/haptic-usage-example"
import { HapticSettings } from "@/components/haptic-settings"
import { HapticDebug } from "@/components/haptic-debug"

export default function HapticExamplesPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <h1 className="text-3xl font-bold">Haptic Feedback Examples</h1>
        <p className="text-muted-foreground">
          This page demonstrates the various haptic feedback capabilities of the HeartHeals application.
        </p>

        <div className="grid gap-8">
          <HapticUsageExample />
          <HapticSettings />
          <HapticDebug />
        </div>
      </div>
    </PageContainer>
  )
}
