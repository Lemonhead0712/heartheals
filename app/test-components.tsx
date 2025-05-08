// Import components one by one to test
import Link from "next/link"
// import OtherComponent from "../components/other-component"

export default function TestComponents() {
  return (
    <div>
      <h1>Test Components</h1>
      <Link href="/">Home Link</Link>
      {/* Add other components one by one */}
    </div>
  )
}
