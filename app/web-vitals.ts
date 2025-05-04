import { reportWebVitals as reportWebVitalsUtil } from "@/utils/performance-monitoring"

export function reportWebVitals(metric: any) {
  // Forward to our utility function
  reportWebVitalsUtil(metric)
}
