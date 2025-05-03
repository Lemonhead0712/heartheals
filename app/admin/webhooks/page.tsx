"use client"

import { WebhookDestinationsManager } from "@/components/webhook-destinations-manager"

export default function WebhooksAdminPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Webhook Management</h1>
      <WebhookDestinationsManager />
    </div>
  )
}
