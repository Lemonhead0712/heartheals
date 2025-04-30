type PerformanceMetric = {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

type PerformanceData = {
  metrics: Record<string, PerformanceMetric[]>
  resourceTiming: PerformanceResourceTiming[]
  navigationTiming?: PerformanceNavigationTiming
  firstPaint?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

class PerformanceMonitor {
  private metrics: Record<string, PerformanceMetric[]> = {}
  private observers: any[] = []
  private isInitialized = false
  private performanceData: PerformanceData = {
    metrics: {},
    resourceTiming: [],
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    if (this.isInitialized || typeof window === "undefined") return
    this.isInitialized = true

    // Collect navigation timing
    if (performance.getEntriesByType) {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navEntry) {
        this.performanceData.navigationTiming = navEntry
      }
    }

    // Collect paint timing
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType("paint")
      paintEntries.forEach((entry) => {
        if (entry.name === "first-paint") {
          this.performanceData.firstPaint = entry.startTime
        }
        if (entry.name === "first-contentful-paint") {
          this.performanceData.firstContentfulPaint = entry.startTime
        }
      })
    }

    // Observe Largest Contentful Paint
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.performanceData.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
        this.observers.push(lcpObserver)

        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const firstInput = entries[0]
          this.performanceData.firstInputDelay = firstInput.processingStart - firstInput.startTime
        })
        fidObserver.observe({ type: "first-input", buffered: true })
        this.observers.push(fidObserver)

        // Observe Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.performanceData.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ type: "layout-shift", buffered: true })
        this.observers.push(clsObserver)

        // Observe resource timing
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceResourceTiming[]
          this.performanceData.resourceTiming = [...this.performanceData.resourceTiming, ...entries]
        })
        resourceObserver.observe({ type: "resource", buffered: true })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn("Performance monitoring not fully supported in this browser", e)
      }
    }
  }

  start(name: string) {
    if (typeof window === "undefined") return

    if (!this.metrics[name]) {
      this.metrics[name] = []
    }

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
    }

    this.metrics[name].push(metric)
    this.performanceData.metrics = this.metrics

    return metric
  }

  end(name: string): number | undefined {
    if (typeof window === "undefined" || !this.metrics[name]) return

    const metric = this.metrics[name][this.metrics[name].length - 1]
    if (!metric || metric.endTime !== undefined) return

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    this.performanceData.metrics = this.metrics

    return metric.duration
  }

  getMetrics() {
    return this.performanceData
  }

  clearMetrics() {
    this.metrics = {}
    this.performanceData.metrics = {}
  }

  disconnect() {
    this.observers.forEach((observer) => {
      if (observer && observer.disconnect) {
        observer.disconnect()
      }
    })
    this.observers = []
  }
}

export const performanceMonitor = new PerformanceMonitor()
