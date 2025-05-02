"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCardDetails } from "@/lib/payment-utils"

interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

interface PaymentMethodSelectorProps {
  customerId: string
  selectedPaymentMethodId: string
  onSelectPaymentMethod: (id: string) => void
  onAddNewPaymentMethod: () => void
  onDeletePaymentMethod: (id: string) => void
  isLoading?: boolean
  error?: string | null
}

export function PaymentMethodSelector({
  customerId,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  onAddNewPaymentMethod,
  onDeletePaymentMethod,
  isLoading = false,
  error = null,
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingMethods, setLoadingMethods] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!customerId) {
        setLoadingMethods(false)
        return
      }

      try {
        const response = await fetch(`/api/payment-methods?customerId=${customerId}`)

        if (!response.ok) {
          throw new Error("Failed to load payment methods")
        }

        const data = await response.json()
        setPaymentMethods(data.paymentMethods || [])

        // If we have payment methods and none is selected, select the first one
        if (data.paymentMethods?.length > 0 && !selectedPaymentMethodId) {
          onSelectPaymentMethod(data.paymentMethods[0].id)
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        setLoadError(error instanceof Error ? error.message : "Failed to load payment methods")
      } finally {
        setLoadingMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [customerId, selectedPaymentMethodId, onSelectPaymentMethod])

  if (loadingMethods) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {paymentMethods.length > 0 ? (
        <RadioGroup
          value={selectedPaymentMethodId}
          onValueChange={onSelectPaymentMethod}
          className="space-y-3"
          disabled={isLoading}
        >
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between space-x-2 border rounded-md p-3 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  {method.card ? formatCardDetails(method.card) : "Payment method"}
                </Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeletePaymentMethod(method.id)}
                disabled={isLoading}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="text-center p-4 border rounded-md bg-gray-50">
          <p className="text-gray-600 mb-2">No payment methods found</p>
        </div>
      )}

      <Button variant="outline" onClick={onAddNewPaymentMethod} disabled={isLoading} className="w-full mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Add Payment Method
      </Button>
    </div>
  )
}
