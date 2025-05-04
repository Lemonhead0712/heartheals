# Haptic Feedback System

This document outlines the haptic feedback system used in the HeartHeals application.

## Overview

The haptic system provides tactile feedback to users through device vibration. It's designed to enhance the user experience by providing physical feedback for interactions.

## Architecture

The haptic system follows a centralized architecture:

1. **Core Logic**: Implemented in `hooks/use-haptic.ts`
2. **Context Provider**: Implemented in `contexts/haptic-context.tsx`
3. **UI Components**: Various haptic-enabled components in `components/ui/`

## Usage Guidelines

### Importing the Hook

Always use the `useHapticContext` hook from the context:

\`\`\`typescript
import { useHapticContext } from "@/contexts/haptic-context"

function MyComponent() {
  const { haptic, patternHaptic } = useHapticContext()
  
  // Use haptic functions
}
\`\`\`

### Available Functions

- `haptic(intensity?)`: Trigger a simple haptic feedback with optional intensity
- `patternHaptic(pattern)`: Trigger a pattern-based haptic feedback
- `updateSettings(newSettings)`: Update haptic settings
- `isHapticSupported()`: Check if haptic feedback is supported on the device

### Intensity Levels

- `"light"`: Subtle feedback for minor interactions
- `"medium"`: Standard feedback for most interactions
- `"strong"`: Stronger feedback for important interactions

### Patterns

- `"single"`: Single vibration
- `"double"`: Double vibration
- `"success"`: Success pattern
- `"error"`: Error pattern
- `"warning"`: Warning pattern
- `"notification"`: Notification pattern

## Best Practices

1. **Use Sparingly**: Overuse of haptic feedback can be annoying to users
2. **Match Intensity to Importance**: Use stronger intensities for more important actions
3. **Provide Alternatives**: Always ensure functionality works without haptic feedback
4. **Test on Real Devices**: Haptic feedback can feel different across devices

## Implementation Examples

### Button with Haptic Feedback

\`\`\`typescript
import { useHapticContext } from "@/contexts/haptic-context"
import { Button } from "@/components/ui/button"

export function HapticButton({ onClick, ...props }) {
  const { haptic } = useHapticContext()
  
  const handleClick = (e) => {
    haptic("medium")
    if (onClick) onClick(e)
  }
  
  return <Button onClick={handleClick} {...props} />
}
\`\`\`

### Success Action with Pattern

\`\`\`typescript
import { useHapticContext } from "@/contexts/haptic-context"

export function SuccessAction() {
  const { patternHaptic } = useHapticContext()
  
  const handleSuccess = () => {
    // Handle success logic
    patternHaptic("success")
  }
  
  return <button onClick={handleSuccess}>Submit</button>
}
