"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HapticButton } from "@/components/ui/haptic-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDistanceToNow } from "date-fns"

// Mock data for demonstration
const mockWebhookEvents = [
  {
    id: "evt_1234567890",
    type: "payment_intent.succeeded",
    timestamp: Date.now() - 1000 * 60 * 5,
    processed: true,
    processingTime: 250,
    result: { success: true },
  },
  {
    id: "evt_0987654321",
    type: "invoice.payment_failed",
    timestamp: Date.now() - 1000 * 60 * 10,
    processed: true,
    processingTime: 320,
    error: { message: "Customer not found" },
  },
  {
    id: "evt_5432167890",
    type: "customer.subscription.created",
    timestamp: Date.now() - 1000 * 60 * 15,
    processed: true,
    processingTime: 180,
    result: { success: true },
  },
]

const mockWebhookMetrics = {
  totalEvents: 156,
  successfulEvents: 142,
  failedEvents: 14,
  averageProcessingTime: 215,
  eventsByType: {
    "payment_intent.succeeded": 78,
    "invoice.payment_succeeded": 45,
    "customer.subscription.created": 12,
    "invoice.payment_failed": 14,
    "customer.subscription.updated": 7,
  },
  errorsCount: 14,
  lastProcessedAt: new Date(Date.now() - 1000 * 60 * 2),
}

export default function WebhookDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [webhookEvents, setWebhookEvents] = useState(mockWebhookEvents)
  const [webhookMetrics, setWebhookMetrics] = useState(mockWebhookMetrics)

  // In a real app, you would fetch this data from your API
  const fetchWebhookEvents = async () => {
    setLoading(true)
    try {
      // const response = await fetch("/api/admin/webhooks/events")
      // const data = await response.json()
      // setWebhookEvents(data)

      // Using mock data for demonstration
      setTimeout(() => {
        setWebhookEvents(mockWebhookEvents)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching webhook events:", error)
      setLoading(false)
    }
  }

  const fetchWebhookMetrics = async () => {
    try {
      // const response = await fetch("/api/admin/webhooks/metrics")
      // const data = await response.json()
      // setWebhookMetrics(data)

      // Using mock data for demonstration
      setWebhookMetrics(mockWebhookMetrics)
    } catch (error) {
      console.error("Error fetching webhook metrics:", error)
    }
  }

  useEffect(() => {
    fetchWebhookEvents()
    fetchWebhookMetrics()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchWebhookMetrics()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchWebhookEvents()
    fetchWebhookMetrics()
  }

  const handleTestWebhook = async () => {
    try {
      // In a real app, you would call your API to send a test webhook
      // await fetch("/api/admin/webhooks/test", { method: "POST" })
      alert("Test webhook sent successfully!")
    } catch (error) {
      console.error("Error sending test webhook:", error)
      alert("Error sending test webhook")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Webhook Dashboard</h1>
        <div className="flex gap-2">
          <HapticButton onClick={handleRefresh} variant="outline">
            Refresh
          </HapticButton>
          <HapticButton onClick={handleTestWebhook} variant="default">
            Send Test Webhook
          </HapticButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhookMetrics.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Last processed{" "}
                  {webhookMetrics.lastProcessedAt
                    ? formatDistanceToNow(webhookMetrics.lastProcessedAt, { addSuffix: true })
                    : "never"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webhookMetrics.totalEvents > 0
                    ? `${Math.round((webhookMetrics.successfulEvents / webhookMetrics.totalEvents) * 100)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {webhookMetrics.successfulEvents} successful / {webhookMetrics.failedEvents} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(webhookMetrics.averageProcessingTime)}ms</div>
                <p className="text-xs text-muted-foreground">Response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      webhookMetrics.failedEvents / webhookMetrics.totalEvents < 0.1 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-lg font-medium">
                    {webhookMetrics.failedEvents / webhookMetrics.totalEvents < 0.1 ? "Healthy" : "Issues Detected"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{webhookMetrics.errorsCount} errors in total</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
              <CardDescription>Distribution of webhook events by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(webhookMetrics.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-40 truncate font-medium">{type}</div>
                    <div className="w-full">
                      <div className="flex items-center">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (count / webhookMetrics.totalEvents) * 100)}%`,
                          }}
                        ></div>
                        <span className="ml-2 text-sm">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>The most recent webhook events received</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processing Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">{event.id}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</TableCell>
                        <TableCell>
                          {event.error ? (
                            <Badge variant="destructive">Failed</Badge>
                          ) : (
                            <Badge variant="default">Success</Badge>
                          )}
                        </TableCell>
                        <TableCell>{event.processingTime}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Logs</CardTitle>
              <CardDescription>Detailed logs of webhook processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-96 overflow-y-auto">
                <div>[2023-05-02 12:34:56] Received webhook event: payment_intent.succeeded (evt_1234567890)</div>
                <div>[2023-05-02 12:34:56] Verifying signature...</div>
                <div>[2023-05-02 12:34:56] Signature verified successfully</div>
                <div>[2023-05-02 12:34:56] Processing event...</div>
                <div>[2023-05-02 12:34:56] Payment intent succeeded: pi_1234567890</div>
                <div>[2023-05-02 12:34:56] Sending receipt email to customer@example.com</div>
                <div>[2023-05-02 12:34:56] Email sent successfully</div>
                <div>[2023-05-02 12:34:56] Event processed successfully in 250ms</div>
                <div>[2023-05-02 12:34:56] Response sent: 200 OK</div>
                <div className="mt-2">
                  [2023-05-02 12:29:56] Received webhook event: invoice.payment_failed (evt_0987654321)
                </div>
                <div>[2023-05-02 12:29:56] Verifying signature...</div>
                <div>[2023-05-02 12:29:56] Signature verified successfully</div>
                <div>[2023-05-02 12:29:56] Processing event...</div>
                <div>[2023-05-02 12:29:56] Invoice payment failed: in_0987654321</div>
                <div className="text-yellow-400">[2023-05-02 12:29:56] Warning: Customer not found</div>
                <div>[2023-05-02 12:29:56] Falling back to default handling</div>
                <div>[2023-05-02 12:29:56] Event processed with warnings in 320ms</div>
                <div>[2023-05-02 12:29:56] Response sent: 200 OK</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
