import type React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusIconTooltipProps {
  isActive: boolean
  tooltipText: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

const StatusIconTooltip: React.FC<StatusIconTooltipProps> = ({ isActive, tooltipText, size = "md", className }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Activity
            className={cn(
              sizeClasses[size],
              "transition-transform",
              isActive ? "text-primary scale-110" : "text-purple-500/70 status-icon-pulse",
              className,
            )}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default StatusIconTooltip
