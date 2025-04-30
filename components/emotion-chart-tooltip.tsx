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
    <div className="bg-white/95 backdrop-blur-sm border border-pink-200 rounded-lg shadow-lg p-3">
      {label && (
        <div className="flex items-center border-b border-pink-100 pb-1.5 mb-1.5">
          <span className="text-sm font-medium text-pink-800 mr-1">{labelFormatter(label)}</span>
          {payload[0]?.payload?.count && (
            <span className="text-xs bg-pink-100 text-pink-600 px-1.5 rounded-full">
              {payload[0].payload.count} {payload[0].payload.count === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
              />
              <p className="text-xs font-medium text-gray-700">{entry.name || entry.dataKey}:</p>
            </div>
            <p className="text-xs font-semibold text-pink-700">{valueFormatter(entry.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
