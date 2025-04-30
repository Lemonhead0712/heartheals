"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CustomPieChartLabel } from "./custom-pie-chart-label"
import { EmotionChartTooltip } from "./emotion-chart-tooltip"

interface EmotionDistribution {
  name: string
  count: number
  color: string
}

interface ResponsiveEmotionPieChartProps {
  data: EmotionDistribution[]
  className?: string
}

export function ResponsiveEmotionPieChart({ data, className = "" }: ResponsiveEmotionPieChartProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 768px)")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Calculate optimal chart dimensions based on screen size
  const getChartConfig = () => {
    if (isMobile) {
      return {
        outerRadius: 70,
        innerRadius: 30,
        labelRadius: 85,
        fontSize: 10,
        maxChars: 6,
        showLabels: false,
      }
    } else if (isTablet) {
      return {
        outerRadius: 90,
        innerRadius: 40,
        labelRadius: 110,
        fontSize: 11,
        maxChars: 8,
        showLabels: true,
      }
    } else {
      return {
        outerRadius: 110,
        innerRadius: 50,
        labelRadius: 130,
        fontSize: 12,
        maxChars: 12,
        showLabels: true,
      }
    }
  }

  const chartConfig = getChartConfig()

  // Handle pie segment hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  // Custom legend that handles long emotion names
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
        {payload.map((entry: any, index: number) => (
          <li
            key={`legend-item-${index}`}
            className="flex items-center text-xs"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
            <span className="text-pink-800 truncate max-w-[100px]" title={entry.value}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    return `${value} entries`
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={chartConfig.outerRadius}
            innerRadius={chartConfig.innerRadius}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            label={
              chartConfig.showLabels
                ? (props) => (
                    <CustomPieChartLabel {...props} fontSize={chartConfig.fontSize} maxChars={chartConfig.maxChars} />
                  )
                : false
            }
            activeIndex={activeIndex !== null ? activeIndex : undefined}
            activeShape={(props) => {
              const RADIAN = Math.PI / 180
              const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, name, count } = props

              // Calculate the position for the active label
              const sin = Math.sin(-RADIAN * midAngle)
              const cos = Math.cos(-RADIAN * midAngle)
              const sx = cx + (outerRadius + 10) * cos
              const sy = cy + (outerRadius + 10) * sin
              const mx = cx + (outerRadius + 30) * cos
              const my = cy + (outerRadius + 30) * sin
              const ex = mx + (cos >= 0 ? 1 : -1) * 22
              const ey = my
              const textAnchor = cos >= 0 ? "start" : "end"

              return (
                <g>
                  {/* Active segment */}
                  <path d={props.arc} fill={fill} stroke="#fff" strokeWidth={2} opacity={0.9} />

                  {/* Line to label */}
                  <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />

                  {/* Label text */}
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill={fill}
                    fontSize={12}
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={textAnchor}
                    fill="#999"
                    fontSize={11}
                  >
                    {`${count} entries (${(props.percent * 100).toFixed(0)}%)`}
                  </text>
                </g>
              )
            }}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={800}
            animationBegin={0}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            content={<EmotionChartTooltip valueFormatter={formatTooltipValue} />}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend content={renderLegend} verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
