"use client"

import type React from "react"

import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DynamicImportProps {
  component: LazyExoticComponent<ComponentType<any>>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

export function DynamicImport({
  component: Component,
  fallback = (
    <div className="w-full flex justify-center p-8">
      <LoadingSpinner size="medium" />
    </div>
  ),
  props = {},
}: DynamicImportProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
}

export function createDynamicComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string,
) {
  const LazyComponent = lazy(importFunc)

  if (displayName) {
    LazyComponent.displayName = displayName
  }

  return (props: React.ComponentProps<T>) => <DynamicImport component={LazyComponent} props={props} />
}
