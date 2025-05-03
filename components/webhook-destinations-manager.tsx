"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WebhookDestination {
  id: string
  name: string
  url: string
  secret?: string
  active: boolean
  eventTypes: string[]
  headers?: Record<string, string>
  retryCount: number
  lastForwarded?: string
  createdAt: string
}

export function WebhookDestinationsManager() {
  const [destinations, setDestinations] = useState<WebhookDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state for new destination
  const [newDestination, setNewDestination] = useState({
    name: "",
    url: "",
    active: true,
    eventTypes: "",
    secret: "",
    retryCount: 3,
  })

  // Load destinations
  const loadDestinations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/webhooks/destinations")

      if (!response.ok) {
        throw new Error(`Failed to load destinations: ${response.status}`)
      }

      const data = await response.json()
      setDestinations(data.destinations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load webhook destinations")
      toast({
        title: "Error",
        description: "Failed to load webhook destinations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load destinations on mount
  useEffect(() => {
    loadDestinations()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDestination((prev) => ({ ...prev, [name]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setNewDestination((prev) => ({ ...prev, active: checked }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/webhooks/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDestination.name,
          url: newDestination.url,
          active: newDestination.active,
          eventTypes: newDestination.eventTypes
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean),
          secret: newDestination.secret || undefined,
          retryCount: Number.parseInt(newDestination.retryCount.toString(), 10),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create destination: ${response.status}`)
      }

      // Reset form
      setNewDestination({
        name: "",
        url: "",
        active: true,
        eventTypes: "",
        secret: "",
        retryCount: 3,
      })

      // Reload destinations
      await loadDestinations()

      toast({
        title: "Success",
        description: "Webhook destination created successfully",
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create webhook destination",
        variant: "destructive",
      })
    }
  }

  // Toggle destination active state
  const toggleDestinationActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/destinations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !currentActive,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update destination: ${response.status}`)
      }

      // Update local state
      setDestinations((prev) => prev.map((dest) => (dest.id === id ? { ...dest, active: !currentActive } : dest)))

      toast({
        title: "Success",
        description: `Destination ${!currentActive ? "enabled" : "disabled"} successfully`,
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update webhook destination",
        variant: "destructive",
      })
    }
  }

  // Delete destination
  const deleteDestination = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook destination?")) {
      return
    }

    try {
      const response = await fetch(`/api/webhooks/destinations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete destination: ${response.status}`)
      }

      // Update local state
      setDestinations((prev) => prev.filter((dest) => dest.id !== id))

      toast({
        title: "Success",
        description: "Webhook destination deleted successfully",
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete webhook destination",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Webhook Destinations</h2>
        <Button onClick={loadDestinations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="destinations">
        <TabsList>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations">
          {loading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Error Loading Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">{error}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={loadDestinations} variant="outline">
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          ) : destinations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Destinations</CardTitle>
                <CardDescription>
                  You haven't added any webhook destinations yet. Add one to start forwarding events.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => document.querySelector('[data-value="add"]')?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Destination
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {destinations.map((destination) => (
                <Card key={destination.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{destination.name}</CardTitle>
                      <Badge variant={destination.active ? "default" : "outline"}>
                        {destination.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="truncate">{destination.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Event Types:</span>{" "}
                        {destination.eventTypes.length > 0 ? destination.eventTypes.join(", ") : "All events"}
                      </div>
                      <div>
                        <span className="font-medium">Retry Count:</span> {destination.retryCount}
                      </div>
                      {destination.lastForwarded && (
                        <div>
                          <span className="font-medium">Last Forwarded:</span>{" "}
                          {new Date(destination.lastForwarded).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={destination.active}
                        onCheckedChange={() => toggleDestinationActive(destination.id, destination.active)}
                      />
                      <Label>{destination.active ? "Enabled" : "Disabled"}</Label>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteDestination(destination.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Add New Webhook Destination</CardTitle>
                <CardDescription>Create a new endpoint to receive forwarded webhook events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Analytics Service"
                    value={newDestination.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    placeholder="https://example.com/webhook"
                    value={newDestination.url}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="eventTypes">Event Types (comma separated, leave empty for all events)</Label>
                  <Input
                    id="eventTypes"
                    name="eventTypes"
                    placeholder="payment_intent.succeeded, payment_intent.payment_failed"
                    value={newDestination.eventTypes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="secret">Signing Secret (optional)</Label>
                  <Input
                    id="secret"
                    name="secret"
                    type="password"
                    placeholder="Used to sign forwarded events"
                    value={newDestination.secret}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    name="retryCount"
                    type="number"
                    min="0"
                    max="10"
                    value={newDestination.retryCount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={newDestination.active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="destinations"]')?.click()}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Destination
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
