"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { addDays, format } from "date-fns"

interface DateRangeSliderProps {
  minDate: Date
  maxDate: Date
  onChange: (range: { start: Date; end: Date }) => void
  className?: string
}

export function DateRangeSlider({ minDate, maxDate, onChange, className }: DateRangeSliderProps) {
  // Calculate total days between min and max dates
  const totalDays = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)))

  // State for the slider (0-100 represents percentage of date range)
  const [range, setRange] = React.useState([0, 100])

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "MMM d")
  }

  // Calculate actual dates from slider values
  const getDateFromPercent = (percent: number) => {
    const dayOffset = Math.round((totalDays * percent) / 100)
    return addDays(minDate, dayOffset)
  }

  // Current selected dates
  const startDate = getDateFromPercent(range[0])
  const endDate = getDateFromPercent(range[1])

  // Handle slider change
  const handleChange = (values: number[]) => {
    setRange(values)
    onChange({
      start: getDateFromPercent(values[0]),
      end: getDateFromPercent(values[1]),
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center text-xs text-pink-700">
        <div>{formatDate(startDate)}</div>
        <div>Selected Range</div>
        <div>{formatDate(endDate)}</div>
      </div>

      <Slider
        defaultValue={[0, 100]}
        value={range}
        min={0}
        max={100}
        step={1}
        onValueChange={handleChange}
        className="w-full"
      />

      <div className="flex justify-between items-center text-xs text-pink-600">
        <div>{formatDate(minDate)}</div>
        <div>{formatDate(maxDate)}</div>
      </div>
    </div>
  )
}
