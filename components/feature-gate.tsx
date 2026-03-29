import type { ReactNode } from "react"

/**
 * FeatureGate is now a pass-through -- all features are free.
 * The component is kept so existing consumers don't break.
 */
type FeatureGateProps = {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ children }: FeatureGateProps) {
  return <>{children}</>
}
