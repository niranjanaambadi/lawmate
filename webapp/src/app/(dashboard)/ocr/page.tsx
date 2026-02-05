// src/app/(dashboard)/ocr/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Save, FileText } from "lucide-react"
import { toast } from "sonner"
import { useCases } from "@/lib/hooks/useCases"

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCase, setSelectedCase] = useState("")
  const [saveFormat, setSaveFormat] = useState<"txt" | "searchable_pdf">("searchable_pdf")

  const { data: cases } = useCases()

  const handleExtract = async () => {
    if (!file) return
    
    setIsProcessing(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/v1/ocr/extract", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      setExtractedText(data.text)
      toast.success("OCR completed")
    } catch (error) {
      toast.error("OCR failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (saveFormat === "txt") {
      const blob = new Blob([extractedText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${file?.name || "document"}_ocr.txt`
      a.click()
    } else {
      // Download searchable PDF
      const formData = new FormData()
      formData.append("file", file!)
      formData.append("text", extractedText)

      const res = await fetch("/api/v1/ocr/create-searchable-pdf", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${file?.name || "document"}_searchable.pdf`
      a.click()
    }
  }

  const handleSaveToCase = async () => {
    if (!selectedCase) {
      toast.error("Please select a case")
      return
    }

    const formData = new FormData()
    formData.append("file", file!)
    formData.append("text", extractedText)
    formData.append("case_id", selectedCase)
    formData.append("format", saveFormat)

    try {
      const res = await fetch("/api/v1/ocr/save-to-case", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      })
      toast.success("Saved to case")
    } catch (error) {
      toast.error("Failed to save")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">OCR Document</h1>

      <Card className="p-6 space-y-4">
        <div>
          <Label>Upload Document</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <Button onClick={handleExtract} disabled={!file || isProcessing}>
          <FileText className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : "Extract Text"}
        </Button>
      </Card>

      {extractedText && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold">Extracted Text</h3>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={15}
            className="w-full p-4 border rounded-lg font-mono text-sm"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Format</Label>
              <Select value={saveFormat} onValueChange={(v: any) => setSaveFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="searchable_pdf">Searchable PDF (Recommended)</SelectItem>
                  <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Save to Case (Optional)</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {cases?.items.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number || c.efiling_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleSaveToCase} variant="outline" disabled={!selectedCase}>
              <Save className="mr-2 h-4 w-4" />
              Save to Case
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
