import { Text } from "recharts"

interface CustomPieChartLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
  name: string
  value: number
  fill: string
  fontSize?: number
  maxChars?: number
}

export function CustomPieChartLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
  fill,
  fontSize = 12,
  maxChars = 10,
}: CustomPieChartLabelProps) {
  // Calculate the position for the label
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)

  // Adjust position based on angle to prevent overlap
  const labelRadius = outerRadius * 1.2
  const x = cx + labelRadius * cos
  const y = cy + labelRadius * sin

  // Determine text anchor based on position
  const textAnchor = cos >= 0 ? "start" : "end"

  // Truncate name if too long
  const truncatedName = name.length > maxChars ? `${name.substring(0, maxChars)}...` : name

  // Only show labels for segments that are significant enough (more than 5%)
  if (percent < 0.05) return null

  return (
    <g>
      {/* Line from pie to label */}
      <path
        d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${x},${y}`}
        stroke={fill}
        fill="none"
        strokeWidth={1}
        opacity={0.7}
      />

      {/* Label text */}
      <Text
        x={x}
        y={y}
        fill={fill}
        fontSize={fontSize}
        fontWeight="500"
        textAnchor={textAnchor}
        dominantBaseline="middle"
      >
        {truncatedName} ({(percent * 100).toFixed(0)}%)
      </Text>
    </g>
  )
}
