// This is a utility file to help identify where the incorrect import is happening
// You can delete this file after fixing the issue
//
// The error is: The "/contexts/haptic-context" module does not provide an export named "useHapticContext"
//
// This means somewhere in the codebase, there's an import like:
// import { useHapticContext } from "/contexts/haptic-context"
//
// But the actual export is:
// export const useHaptic = () => { ... }
