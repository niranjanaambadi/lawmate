import { useState } from "react"
import type { Document } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatFileSize } from "@/lib/utils/file"
import { formatDate } from "@/lib/utils/date"
import { FileText, Download, Eye, Trash2, MoreVertical, Lock } from "lucide-react"
import Link from "next/link"
import { useDeleteDocument } from "@/lib/hooks/useDocuments"
import { cn } from "@/lib/utils/cn"

interface DocumentListProps {
  documents: Document[]
  caseId: string
}

export function DocumentList({ documents, caseId }: DocumentListProps) {
  const { mutate: deleteDocument } = useDeleteDocument()

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(id)
    }
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const categoryLabels: Record<string, string> = {
    case_file: "Case File",
    annexure: "Annexures",
    judgment: "Judgments",
    order: "Orders",
    misc: "Miscellaneous",
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedDocuments).map(([category, docs]) => (
        <div key={category}>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            {categoryLabels[category] || category}
            <Badge variant="default" className="ml-2">
              {docs.length}
            </Badge>
          </h3>

          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all group",
                  doc.is_locked && "bg-slate-50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center border border-red-200">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {doc.title}
                      </h4>
                      {doc.is_locked && (
                        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <Lock className="h-3 w-3" />
                          Locked
                        </div>
                      )}
                    </div>

                    {doc.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>
                        Uploaded {formatDate(doc.created_at, "PPP")}
                      </span>
                      {doc.upload_status === "completed" && (
                        <>
                          <span>•</span>
                          <Badge variant="success" className="text-xs">
                            Ready
                          </Badge>
                        </>
                      )}
                      {doc.upload_status === "pending" && (
                        <>
                          <span>•</span>
                          <Badge variant="warning" className="text-xs">
                            Processing
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/documents/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/documents/${doc.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Document
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        {!doc.is_locked && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}