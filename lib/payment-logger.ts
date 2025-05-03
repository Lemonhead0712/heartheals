import { clientEnv } from "./environment"

export function logPaymentEvent(stage: string, data: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] PAYMENT_FLOW | ${stage} |`, data)

  // In development, store in localStorage for debugging
  if (typeof window !== "undefined" && clientEnv.isDevelopment) {
    try {
      const logs = JSON.parse(localStorage.getItem("payment_flow_logs") || "[]")
      logs.push({ timestamp, stage, data })
      localStorage.setItem("payment_flow_logs", JSON.stringify(logs.slice(-50)))
    } catch (error) {
      console.error("Error storing payment log:", error)
    }
  }
}
