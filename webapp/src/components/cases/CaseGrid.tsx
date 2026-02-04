import { useCases } from "@/lib/hooks/useCases"
import { CaseCard } from "./CaseCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { Scale } from "lucide-react"
import type { CaseFilters } from "@/types/case"

interface CaseGridProps {
  filters?: CaseFilters
  onFiltersChange?: (filters: CaseFilters) => void
}

export function CaseGrid({ filters }: CaseGridProps) {
  const { data, isLoading } = useCases(filters)

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="h-8 w-8 text-slate-400" />}
        title="No cases found"
        message="Try adjusting your filters or search criteria."
      />
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.items.map((caseItem) => (
        <CaseCard key={caseItem.id} case={caseItem} />
      ))}
    </div>
  )
}


// import { useCases } from "@/lib/hooks/useCases"
// import { CaseCard } from "./CaseCard"
// import { EmptyState } from "@/components/shared/EmptyState"
// import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
// import { Scale } from "lucide-react"
// import type { CaseFilters } from "@/types/case"

// interface CaseGridProps {
//   initialFilters?: CaseFilters
// }

// export function CaseGrid({ initialFilters }: CaseGridProps) {
//   const { data, isLoading } = useCases(initialFilters)

//   if (isLoading) {
//     return (
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <LoadingSkeleton key={i} className="h-64 w-full rounded-xl" />
//         ))}
//       </div>
//     )
//   }
// // Fix: data is an array
//   if (!data || data.length === 0) {
//     return (
//       <EmptyState
//         icon={<Scale className="h-8 w-8 text-slate-400" />}
//         title="No cases found"
//         message="Try adjusting your filters or search criteria."
//       />
//     )
//   }

//   return (
//     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//       {data.map((caseItem) => (
//         <CaseCard key={caseItem.id} case={caseItem} />
//       ))}
//     </div>
//   )
// }

// import { useCases } from "@/lib/hooks/useCases"
// import { CaseCard } from "./CaseCard"
// import { EmptyState } from "@/components/shared/EmptyState"
// import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
// import { Scale } from "lucide-react"
// import type { CaseFilters } from "@/types/case"

// interface CaseGridProps {
//   filters?: CaseFilters
//   onFiltersChange?: (filters: CaseFilters) => void
// }

// export function CaseGrid({ filters }: CaseGridProps) {
//   const { data, isLoading } = useCases(filters)

//   if (isLoading) {
//     return (
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <LoadingSkeleton key={i} className="h-64 w-full rounded-xl" />
//         ))}
//       </div>
//     )
//   }

//   if (!data || data.items.length === 0) {
//     return (
//       <EmptyState
//         icon={<Scale className="h-8 w-8 text-slate-400" />}
//         title="No cases found"
//         message="Try adjusting your filters or search criteria."
//       />
//     )
//   }

//   return (
//     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//       {data.items.map((caseItem) => (
//         <CaseCard key={caseItem.id} case={caseItem} />
//       ))}
//     </div>
//   )
// }