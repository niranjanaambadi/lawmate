import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { CaseFilters as CaseFiltersType } from "@/types/case"

interface CaseFiltersProps {
  filters: CaseFiltersType
  onChange: (filters: CaseFiltersType) => void
}

export function CaseFilters({ filters, onChange }: CaseFiltersProps) {
  const handleReset = () => {
    onChange({
      status: "all",
      sort: "next_hearing_date",
      order: "asc",
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Case number, parties..."
              value={filters.search || ""}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onChange({ ...filters, status: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="filed">Filed</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Case Type Filter */}
        <div className="space-y-2">
          <Label>Case Type</Label>
          <Select
            value={filters.case_type || "all"}
            onValueChange={(value) =>
              onChange({ ...filters, case_type: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="WP(C)">WP(C)</SelectItem>
              <SelectItem value="CRLA">CRLA</SelectItem>
              <SelectItem value="OP">OP</SelectItem>
              <SelectItem value="WA">WA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label>Year</Label>
          <Select
            value={filters.case_year?.toString() || "all"}
            onValueChange={(value) =>
              onChange({
                ...filters,
                case_year: value === "all" ? undefined : parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}