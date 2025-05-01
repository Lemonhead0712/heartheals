"use client"

import { useState } from "react"
import { useSubscription } from "@/contexts/subscription-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Beaker, RefreshCw, AlertTriangle, CheckCircle2, Lock, MinimizeIcon, MaximizeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export function SubscriptionTestPanel() {
  const {
    tier,
    isActive,
    expiresAt,
    featureUsage,
    setTier,
    setIsActive,
    setExpiresAt,
    resetFeatureUsage,
    resetAllFeatureUsage,
    isTestMode,
    setIsTestMode,
  } = useSubscription()

  const [isMinimized, setIsMinimized] = useState(false)
  const [daysToExpiration, setDaysToExpiration] = useState("30")
  const [showActivationMessage, setShowActivationMessage] = useState(false)

  // Function to activate premium features
  const activatePremium = () => {
    setTier("premium")
    setIsActive(true)
    const date = new Date()
    date.setDate(date.getDate() + 30)
    setExpiresAt(date)
    resetAllFeatureUsage()
    setIsTestMode(true)
    toast({
      title: "Premium Features Activated",
      description: "All premium features are now unlocked for 30 days.",
      variant: "default",
    })
    setShowActivationMessage(true)
  }

  // Function to deactivate premium features
  const deactivatePremium = () => {
    setTier("free")
    setIsActive(false)
    setExpiresAt(null)
    setIsTestMode(false)
    toast({
      title: "Reverted to Free Tier",
      description: "Premium features are now locked.",
      variant: "default",
    })
    setShowActivationMessage(false)
  }

  // Function to set expiration date
  const handleSetExpiration = () => {
    const days = Number.parseInt(daysToExpiration)
    if (!isNaN(days)) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      setExpiresAt(date)
    }
  }

  // If minimized, show only a small button
  if (isMinimized) {
    return (
      <div id="hh-test-panel-container" className="fixed bottom-20 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          className={`${
            isTestMode
              ? "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
              : "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
          } flex items-center gap-1`}
          onClick={() => setIsMinimized(false)}
        >
          <Beaker className="h-4 w-4" />
          <MaximizeIcon className="h-3 w-3" />
          {isTestMode && (
            <Badge variant="outline" className="ml-1 h-5 border-purple-400 text-purple-700 text-[10px]">
              ON
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div id="hh-test-panel-container" className="fixed bottom-20 right-4 z-50 w-80">
      <Card className={`${isTestMode ? "border-purple-300 bg-purple-50" : "border-yellow-300 bg-yellow-50"} shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className={`${isTestMode ? "text-purple-800" : "text-yellow-800"} flex items-center text-sm`}>
              <Beaker className="h-4 w-4 mr-1" />
              Test Mode Panel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsMinimized(true)}
              title="Minimize panel"
            >
              <MinimizeIcon className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className={`${isTestMode ? "text-purple-700" : "text-yellow-700"} text-xs`}>
            {isTestMode ? (
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 inline mr-1 text-green-600" />
                Premium features are active
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Activate to test premium features
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center justify-between">
            <Label htmlFor="test-mode" className={isTestMode ? "text-purple-800" : "text-yellow-800"}>
              Test Mode
            </Label>
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={(checked) => {
                setIsTestMode(checked)
                if (checked && !isActive) {
                  activatePremium()
                } else if (!checked && isActive) {
                  deactivatePremium()
                }
              }}
              className={`${isTestMode ? "data-[state=checked]:bg-purple-600" : "data-[state=checked]:bg-yellow-600"}`}
            />
          </div>

          {isTestMode && (
            <div className="bg-purple-100 rounded-md p-3 text-xs text-purple-800">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                <span className="font-medium">Test Mode Active</span>
              </div>
              <p>All premium features are now available for testing.</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              size="sm"
              className={`w-1/2 text-xs h-8 ${
                isTestMode ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
              onClick={activatePremium}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Activate Premium
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`w-1/2 text-xs h-8 ${
                isTestMode
                  ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                  : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
              }`}
              onClick={deactivatePremium}
            >
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Revert to Free
            </Button>
          </div>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 ${isTestMode ? "bg-purple-100" : "bg-yellow-100"}`}>
              <TabsTrigger
                value="status"
                className={`text-xs ${
                  isTestMode ? "data-[state=active]:bg-purple-200" : "data-[state=active]:bg-yellow-200"
                }`}
              >
                Status
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className={`text-xs ${
                  isTestMode ? "data-[state=active]:bg-purple-200" : "data-[state=active]:bg-yellow-200"
                }`}
              >
                Feature Usage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-3 mt-2">
              <div className="space-y-2">
                <Label className={`${isTestMode ? "text-purple-800" : "text-yellow-800"} text-xs`}>
                  Subscription Tier
                </Label>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={tier === "free" ? "default" : "outline"}
                    className={
                      tier === "free"
                        ? `${
                            isTestMode ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700"
                          } text-xs h-8`
                        : `${
                            isTestMode
                              ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                              : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                          } text-xs h-8`
                    }
                    onClick={() => setTier("free")}
                  >
                    Free
                  </Button>
                  <Button
                    size="sm"
                    variant={tier === "premium" ? "default" : "outline"}
                    className={
                      tier === "premium"
                        ? `${
                            isTestMode ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700"
                          } text-xs h-8`
                        : `${
                            isTestMode
                              ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                              : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                          } text-xs h-8`
                    }
                    onClick={() => setTier("premium")}
                  >
                    Premium
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={`${isTestMode ? "text-purple-800" : "text-yellow-800"} text-xs`}>
                  Subscription Status
                </Label>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={
                      isActive
                        ? `${
                            isTestMode ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700"
                          } text-xs h-8`
                        : `${
                            isTestMode
                              ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                              : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                          } text-xs h-8`
                    }
                    onClick={() => setIsActive(true)}
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={!isActive ? "default" : "outline"}
                    className={
                      !isActive
                        ? `${
                            isTestMode ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700"
                          } text-xs h-8`
                        : `${
                            isTestMode
                              ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                              : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                          } text-xs h-8`
                    }
                    onClick={() => setIsActive(false)}
                  >
                    Inactive
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={`${isTestMode ? "text-purple-800" : "text-yellow-800"} text-xs`}>
                  Expiration Date
                </Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={daysToExpiration}
                    onChange={(e) => setDaysToExpiration(e.target.value)}
                    className={`h-8 text-xs ${isTestMode ? "border-purple-300" : "border-yellow-300"}`}
                    placeholder="Days"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${
                      isTestMode
                        ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                        : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                    } text-xs h-8`}
                    onClick={handleSetExpiration}
                  >
                    Set
                  </Button>
                </div>
                <p className={`text-xs ${isTestMode ? "text-purple-700" : "text-yellow-700"}`}>
                  {expiresAt ? `Expires: ${expiresAt.toLocaleDateString()}` : "No expiration set"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-3 mt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className={`${isTestMode ? "text-purple-800" : "text-yellow-800"} text-xs`}>
                    Feature Usage
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-7 ${
                      isTestMode
                        ? "border-purple-300 text-purple-800 hover:bg-purple-200"
                        : "border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                    } text-xs`}
                    onClick={resetAllFeatureUsage}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset All
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(featureUsage).length > 0 ? (
                    Object.entries(featureUsage).map(([feature, count]) => (
                      <div
                        key={feature}
                        className={`flex justify-between items-center ${
                          isTestMode ? "bg-purple-100" : "bg-yellow-100"
                        } p-2 rounded-md`}
                      >
                        <span className={`text-xs ${isTestMode ? "text-purple-800" : "text-yellow-800"}`}>
                          {feature}: {count}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-6 w-6 p-0 ${
                            isTestMode
                              ? "text-purple-700 hover:text-purple-900 hover:bg-purple-200"
                              : "text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200"
                          }`}
                          onClick={() => resetFeatureUsage(feature)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs ${isTestMode ? "text-purple-700" : "text-yellow-700"} italic`}>
                      No feature usage recorded
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pt-0">
          <p className={`text-xs ${isTestMode ? "text-purple-700" : "text-yellow-700"} italic`}>
            Changes made here are for testing purposes only and will be stored in localStorage.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
