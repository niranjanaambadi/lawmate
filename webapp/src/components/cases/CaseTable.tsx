// src/components/cases/CaseTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CaseNumber } from "@/components/shared/CaseNumber"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useCases } from "@/lib/hooks/useCases"
import { formatDate } from "@/lib/utils/date"
import { ArrowUpDown, Eye, FileText, Scale } from "lucide-react"
import Link from "next/link"
import type { CaseFilters } from "@/types/case"

interface CaseTableProps {
  filters?: CaseFilters
  onFiltersChange?: (filters: CaseFilters) => void
}

export function CaseTable({ filters, onFiltersChange }: CaseTableProps) {
  const { data, isLoading } = useCases(filters)

  const handleSort = (field: CaseFilters["sort"]) => {
    if (!onFiltersChange || !filters) return
    
    onFiltersChange({
      ...filters,
      sort: field,
      order: filters.sort === field && filters.order === "asc" ? "desc" : "asc",
    })
  }

  if (isLoading) {
    return <TableSkeleton rows={10} />
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="h-8 w-8 text-slate-400" />}
        title="No cases found"
        message="You don't have any cases matching the current filters."
      />
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("case_number")}
                className="hover:bg-slate-100"
              >
                Case Number
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Parties</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("next_hearing_date")}
                className="hover:bg-slate-100"
              >
                Next Hearing
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((caseItem) => (
            <TableRow key={caseItem.id} className="group">
              <TableCell>
                <CaseNumber
                  caseNumber={caseItem.case_number || caseItem.efiling_number}
                />
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <div className="font-medium text-slate-900 truncate">
                    {caseItem.petitioner_name}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    vs {caseItem.respondent_name}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={caseItem.status} />
              </TableCell>
              <TableCell>
                {caseItem.next_hearing_date ? (
                  <div>
                    <div className="font-medium text-slate-900">
                      {formatDate(caseItem.next_hearing_date, "PP")}
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatDate(caseItem.next_hearing_date, "p")}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">Not scheduled</span>
                )}
              </TableCell>
              <TableCell>
                {caseItem.ai_analysis?.urgency_level ? (
                  <UrgencyBadge
                    level={caseItem.ai_analysis.urgency_level}
                    showIcon={false}
                  />
                ) : (
                  <span className="text-xs text-slate-500">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span>{caseItem.documents?.length || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/cases/${caseItem.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { CaseNumber } from "@/components/shared/CaseNumber"
// import { StatusBadge } from "@/components/shared/StatusBadge"
// import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
// import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
// import { EmptyState } from "@/components/shared/EmptyState"
// import { useCases } from "@/lib/hooks/useCases"
// import { formatDate } from "@/lib/utils/date"
// import { ArrowUpDown, Eye, FileText, Scale } from "lucide-react"
// import Link from "next/link"
// import type { CaseFilters } from "@/types/case"
// import { useState } from "react"

// interface CaseTableProps {
//   initialFilters?: CaseFilters
// }

// export function CaseTable({ initialFilters }: CaseTableProps) {
//   const [filters, setFilters] = useState<CaseFilters>(
//     initialFilters || {
//       status: "all",
//       sort: "next_hearing_date",
//       order: "asc",
//     }
//   )

//   const { data, isLoading } = useCases(filters)

//   const handleSort = (field: CaseFilters["sort"]) => {
//     setFilters((prev) => ({
//       ...prev,
//       sort: field,
//       order: prev.sort === field && prev.order === "asc" ? "desc" : "asc",
//     }))
//   }

//   if (isLoading) {
//     return <TableSkeleton rows={10} />
//   }

//   // Fix: data is an array, not an object with items
//   if (!data || data.length === 0) {
//     return (
//       <EmptyState
//         icon={<Scale className="h-8 w-8 text-slate-400" />}
//         title="No cases found"
//         message="You don't have any cases matching the current filters."
//       />
//     )
//   }

//   return (
//     <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSort("case_number")}
//                 className="hover:bg-slate-100"
//               >
//                 Case Number
//                 <ArrowUpDown className="ml-2 h-3 w-3" />
//               </Button>
//             </TableHead>
//             <TableHead>Parties</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSort("next_hearing_date")}
//                 className="hover:bg-slate-100"
//               >
//                 Next Hearing
//                 <ArrowUpDown className="ml-2 h-3 w-3" />
//               </Button>
//             </TableHead>
//             <TableHead>Priority</TableHead>
//             <TableHead>Documents</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {data.map((caseItem) => (
//             <TableRow key={caseItem.id} className="group">
//               <TableCell>
//                 <CaseNumber
//                   caseNumber={caseItem.case_number || caseItem.efiling_number}
//                 />
//               </TableCell>
//               <TableCell>
//                 <div className="max-w-xs">
//                   <div className="font-medium text-slate-900 truncate">
//                     {caseItem.petitioner_name}
//                   </div>
//                   <div className="text-sm text-slate-600 truncate">
//                     vs {caseItem.respondent_name}
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <StatusBadge status={caseItem.status} />
//               </TableCell>
//               <TableCell>
//                 {caseItem.next_hearing_date ? (
//                   <div>
//                     <div className="font-medium text-slate-900">
//                       {formatDate(caseItem.next_hearing_date, "PP")}
//                     </div>
//                     <div className="text-xs text-slate-600">
//                       {formatDate(caseItem.next_hearing_date, "p")}
//                     </div>
//                   </div>
//                 ) : (
//                   <span className="text-sm text-slate-500">Not scheduled</span>
//                 )}
//               </TableCell>
//               <TableCell>
//                 {caseItem.ai_analysis?.urgency_level ? (
//                   <UrgencyBadge
//                     level={caseItem.ai_analysis.urgency_level}
//                     showIcon={false}
//                   />
//                 ) : (
//                   <span className="text-xs text-slate-500">—</span>
//                 )}
//               </TableCell>
//               <TableCell>
//                 <div className="flex items-center gap-1 text-sm text-slate-600">
//                   <FileText className="h-4 w-4" />
//                   <span>{caseItem.documents?.length || 0}</span>
//                 </div>
//               </TableCell>
//               <TableCell className="text-right">
//                 <Link href={`/cases/${caseItem.id}`}>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <Eye className="mr-2 h-4 w-4" />
//                     View
//                   </Button>
//                 </Link>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }



// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { CaseNumber } from "@/components/shared/CaseNumber"
// import { StatusBadge } from "@/components/shared/StatusBadge"
// import { UrgencyBadge } from "@/components/shared/UrgencyBadge"
// import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
// import { EmptyState } from "@/components/shared/EmptyState"
// import { useCases } from "@/lib/hooks/useCases"
// import { formatDate } from "@/lib/utils/date"
// import { ArrowUpDown, Eye, FileText, Scale } from "lucide-react"
// import Link from "next/link"
// import type { CaseFilters } from "@/types/case"
// import { useState } from "react"

// interface CaseTableProps {
//   initialFilters?: CaseFilters
// }

// export function CaseTable({ initialFilters }: CaseTableProps) {
//   const [filters, setFilters] = useState<CaseFilters>(
//     initialFilters || {
//       status: "all",
//       sort: "next_hearing_date",
//       order: "asc",
//     }
//   )

//   const { data, isLoading } = useCases(filters)

//   const handleSort = (field: CaseFilters["sort"]) => {
//     setFilters((prev) => ({
//       ...prev,
//       sort: field,
//       order: prev.sort === field && prev.order === "asc" ? "desc" : "asc",
//     }))
//   }

//   if (isLoading) {
//     return <TableSkeleton rows={10} />
//   }

//   if (!data || data.items.length === 0) {
//     return (
//       <EmptyState
//         icon={<Scale className="h-8 w-8 text-slate-400" />}
//         title="No cases found"
//         message="You don't have any cases matching the current filters."
//       />
//     )
//   }

//   return (
//     <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSort("case_number")}
//                 className="hover:bg-slate-100"
//               >
//                 Case Number
//                 <ArrowUpDown className="ml-2 h-3 w-3" />
//               </Button>
//             </TableHead>
//             <TableHead>Parties</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleSort("next_hearing_date")}
//                 className="hover:bg-slate-100"
//               >
//                 Next Hearing
//                 <ArrowUpDown className="ml-2 h-3 w-3" />
//               </Button>
//             </TableHead>
//             <TableHead>Priority</TableHead>
//             <TableHead>Documents</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {data.items.map((caseItem) => (
//             <TableRow key={caseItem.id} className="group">
//               <TableCell>
//                 <CaseNumber
//                   caseNumber={caseItem.case_number || caseItem.efiling_number}
//                 />
//               </TableCell>
//               <TableCell>
//                 <div className="max-w-xs">
//                   <div className="font-medium text-slate-900 truncate">
//                     {caseItem.petitioner_name}
//                   </div>
//                   <div className="text-sm text-slate-600 truncate">
//                     vs {caseItem.respondent_name}
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <StatusBadge status={caseItem.status} />
//               </TableCell>
//               <TableCell>
//                 {caseItem.next_hearing_date ? (
//                   <div>
//                     <div className="font-medium text-slate-900">
//                       {formatDate(caseItem.next_hearing_date, "PP")}
//                     </div>
//                     <div className="text-xs text-slate-600">
//                       {formatDate(caseItem.next_hearing_date, "p")}
//                     </div>
//                   </div>
//                 ) : (
//                   <span className="text-sm text-slate-500">Not scheduled</span>
//                 )}
//               </TableCell>
//               <TableCell>
//                 {caseItem.ai_analysis?.urgency_level ? (
//                   <UrgencyBadge
//                     level={caseItem.ai_analysis.urgency_level}
//                     showIcon={false}
//                   />
//                 ) : (
//                   <span className="text-xs text-slate-500">—</span>
//                 )}
//               </TableCell>
//               <TableCell>
//                 <div className="flex items-center gap-1 text-sm text-slate-600">
//                   <FileText className="h-4 w-4" />
//                   <span>{caseItem.documents?.length || 0}</span>
//                 </div>
//               </TableCell>
//               <TableCell className="text-right">
//                 <Link href={`/cases/${caseItem.id}`}>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <Eye className="mr-2 h-4 w-4" />
//                     View
//                   </Button>
//                 </Link>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {/* Pagination - to be implemented */}
//       {data.total_pages > 1 && (
//         <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
//           <div className="text-sm text-slate-600">
//             Showing {data.items.length} of {data.total} cases
//           </div>
//           {/* Add pagination controls here */}
//         </div>
//       )}
//     </div>
//   )
// }