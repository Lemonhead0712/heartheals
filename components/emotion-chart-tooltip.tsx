interface EmotionTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
}

export function EmotionChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => `${value}/10`,
  labelFormatter = (label) => label,
}: EmotionTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white/95 border border-pink-200 rounded-lg shadow-lg p-3 backdrop-blur-sm">
      {label && <p className="text-sm font-medium text-pink-800 mb-1">{labelFormatter(label)}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
            />
            <p className="text-xs">
              <span className="font-medium">{entry.name || entry.dataKey}: </span>
              <span>{valueFormatter(entry.value)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
