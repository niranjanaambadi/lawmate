import { Badge } from "@/components/ui/badge"
import type { CaseStatus } from "@/types/case"
import { formatCaseStatus } from "@/lib/utils/format"

interface StatusBadgeProps {
  status: CaseStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
//   const variantMap: Record<CaseStatus, "default" | "success" | "warning" | "destructive"> = {
//     filed: "default",
//     registered: "primary",
//     pending: "warning",
//     disposed: "success",
//     transferred: "default",
//   }
  const variantMap={
    filed: "default",
    registered: "primary",    // Now this works!
    pending: "warning",
    disposed: "success",
    transferred: "outline",
  } as const; // 'as const' makes the mapping read-only and precise

  return (
    <Badge variant={variantMap[status]}>
      {formatCaseStatus(status)}
    </Badge>
    
  )
}