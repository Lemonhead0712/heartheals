import type React from "react"
// Create a simplified version of your layout
export default function LayoutTest({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
