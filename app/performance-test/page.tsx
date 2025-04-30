import { PerformanceTest } from "@/components/performance-test"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { PageContainer } from "@/components/page-container"

export default function PerformanceTestPage() {
  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Performance Testing</h1>
        <div className="space-y-8">
          <PerformanceDashboard />
          <PerformanceTest />
        </div>
      </div>
    </PageContainer>
  )
}
