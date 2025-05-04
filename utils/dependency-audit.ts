/**
 * Dependency Audit Utilities for HeartHeals
 *
 * This file provides utilities for analyzing and optimizing dependencies.
 * It's meant to be used during development to identify optimization opportunities.
 */

interface DependencyInfo {
  name: string
  size: number // in KB
  gzipSize: number // in KB
  treeshakeable: boolean
  alternatives?: string[]
  optimizationSuggestions?: string[]
}

// Example dependency analysis (in a real app, this would be generated dynamically)
export const dependencyAnalysis: Record<string, DependencyInfo> = {
  react: {
    name: "react",
    size: 6.3,
    gzipSize: 2.7,
    treeshakeable: false,
    optimizationSuggestions: [
      "React is a core dependency and cannot be replaced, but ensure you're using React.memo for expensive components",
    ],
  },
  "react-dom": {
    name: "react-dom",
    size: 115.5,
    gzipSize: 36.6,
    treeshakeable: false,
    optimizationSuggestions: [
      "Core dependency, cannot be replaced",
      "Consider using React Server Components where possible to reduce client-side JS",
    ],
  },
  "@react-email/components": {
    name: "@react-email/components",
    size: 45.2,
    gzipSize: 12.8,
    treeshakeable: true,
    alternatives: ["mjml-react", "custom email templates"],
    optimizationSuggestions: [
      "Import only the specific components you need rather than the entire library",
      "Consider moving email rendering to a separate API endpoint to reduce client bundle size",
    ],
  },
  "@react-email/render": {
    name: "@react-email/render",
    size: 12.4,
    gzipSize: 4.2,
    treeshakeable: false,
    optimizationSuggestions: ["Only use in server components or API routes, never in client components"],
  },
  resend: {
    name: "resend",
    size: 15.7,
    gzipSize: 5.3,
    treeshakeable: false,
    optimizationSuggestions: ["Only use in server components or API routes, never in client components"],
  },
}

/**
 * Identifies potential optimization opportunities in dependencies
 */
export function getOptimizationOpportunities(): Array<{ dependency: string; suggestion: string }> {
  const opportunities: Array<{ dependency: string; suggestion: string }> = []

  Object.values(dependencyAnalysis).forEach((dep) => {
    if (dep.optimizationSuggestions && dep.optimizationSuggestions.length > 0) {
      dep.optimizationSuggestions.forEach((suggestion) => {
        opportunities.push({
          dependency: dep.name,
          suggestion,
        })
      })
    }
  })

  return opportunities
}

/**
 * Identifies large dependencies that might be candidates for optimization
 */
export function getLargeDependencies(thresholdKb = 50): DependencyInfo[] {
  return Object.values(dependencyAnalysis)
    .filter((dep) => dep.size > thresholdKb)
    .sort((a, b) => b.size - a.size)
}

/**
 * Suggests code splitting opportunities based on dependency size
 */
export function getCodeSplittingOpportunities(): Array<{ dependency: string; suggestion: string }> {
  const opportunities: Array<{ dependency: string; suggestion: string }> = []

  const largeDeps = getLargeDependencies(30)
  largeDeps.forEach((dep) => {
    if (dep.treeshakeable) {
      opportunities.push({
        dependency: dep.name,
        suggestion: `Import specific parts of ${dep.name} instead of the whole library`,
      })
    } else {
      opportunities.push({
        dependency: dep.name,
        suggestion: `Consider dynamic importing ${dep.name} or moving to a separate chunk`,
      })
    }
  })

  return opportunities
}
