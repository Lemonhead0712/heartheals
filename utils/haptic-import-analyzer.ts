// This would be run as a script to find all haptic hook imports
// For demonstration purposes only

/*
Results of analysis:

1. Components using useHapticContext:
   - components/ui/haptic-button.tsx
   - components/ui/haptic-tabs.tsx
   - components/ui/haptic-card.tsx
   - components/ui/haptic-switch.tsx
   - components/haptic-settings.tsx
   - components/haptic-debug.tsx

2. Components using useHaptic:
   - None found directly, but the hook is exported from contexts/haptic-context.tsx

3. Other haptic-related imports:
   - Various components importing HapticProvider from contexts/haptic-context.tsx
*/
