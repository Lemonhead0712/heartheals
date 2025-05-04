/**
 * Bundle Analyzer Configuration for HeartHeals
 *
 * This file contains configuration for analyzing and optimizing
 * the application bundle size.
 */

export const analyzerConfig = {
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: "static",
  reportFilename: "bundle-report.html",
}

export interface BundleMetrics {
  totalSize: number
  initialJsSize: number
  initialCssSize: number
  largestDependencies: Array<{ name: string; size: number }>
}

export const knownIssues = [
  {
    module: "chart.js",
    issue: "Large bundle size impact",
    recommendation: "Use dynamic import or consider a lighter alternative",
  },
  {
    module: "moment",
    issue: "Large and often partially used",
    recommendation: "Replace with date-fns or Luxon for smaller bundle size",
  },
  {
    module: "lodash",
    issue: "Importing entire library",
    recommendation: "Use specific imports like \"import _merge from 'lodash/merge'\"",
  },
]

export const optimizationTips = [
  {
    title: "Code Splitting",
    description: "Split your code into smaller chunks that can be loaded on demand",
    implementation: `
// Before
import HeavyComponent from '@/components/heavy-component';

// After
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <p>Loading...</p>
});
`,
  },
  {
    title: "Tree Shaking Verification",
    description: "Ensure unused code is being properly eliminated",
    implementation: `
// Check your imports to ensure they're tree-shakable
// Bad:
import * as lodash from 'lodash';

// Good:
import { debounce, throttle } from 'lodash';
// Even better:
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
`,
  },
  {
    title: "Image Optimization",
    description: "Use Next.js Image component for automatic optimization",
    implementation: `
// Before
<img src="/large-image.jpg" alt="Description" />

// After
import Image from 'next/image';

<Image 
  src="/large-image.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
`,
  },
]
