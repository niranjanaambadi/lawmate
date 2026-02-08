"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Save, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCases } from "@/lib/hooks/useCases"
import { useSession } from "next-auth/react"

export default function OCRPage() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCase, setSelectedCase] = useState("")
  const [saveFormat, setSaveFormat] = useState<"txt" | "searchable_pdf">("searchable_pdf")

  const { data: cases } = useCases()

  const handleExtract = async () => {
    if (!file) return
    
    setIsProcessing(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr/extract`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      })
      
      if (!res.ok) throw new Error("OCR failed")
      
      const data = await res.json()
      setExtractedText(data.text)
      toast.success(`OCR completed - ${data.pages} pages processed`)
    } catch (error) {
      toast.error("OCR failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!file || !extractedText) return
    
    setIsDownloading(true)

    try {
      if (saveFormat === "txt") {
        const blob = new Blob([extractedText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${file.name.replace(/\.[^/.]+$/, "")}_ocr.txt`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Text file downloaded")
      } else {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("text", extractedText)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr/create-searchable-pdf`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${session?.accessToken}`
          }
        })
        
        if (!res.ok) throw new Error("PDF creation failed")
        
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${file.name.replace(/\.[^/.]+$/, "")}_searchable.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Searchable PDF downloaded")
      }
    } catch (error) {
      toast.error("Download failed")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSaveToCase = async () => {
    if (!selectedCase || !file || !extractedText) {
      toast.error("Please select a case")
      return
    }

    setIsSaving(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("text", extractedText)
    formData.append("caseId", selectedCase) // FIXED: case_id → caseId
    formData.append("format", saveFormat)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr/save-to-case`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      })
      
      if (!res.ok) throw new Error("Save failed")
      
      toast.success("Document saved to case")
      setSelectedCase("")
    } catch (error) {
      toast.error("Failed to save to case")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          OCR Document
        </h1>
        <p className="text-slate-600 mt-1">
          Extract searchable text from scanned documents
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-slate-900 font-medium">
            Upload Document
          </Label>
          <p className="text-sm text-slate-600 mb-2">
            Supports PDF, JPG, PNG (Max 50MB)
          </p>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
                toast.error("File size must be less than 50MB")
                return
              }
              setFile(selectedFile || null)
              setExtractedText("")
            }}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{file.name}</span>
            <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}

        <Button 
          onClick={handleExtract} 
          disabled={!file || isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Extract Text
            </>
          )}
        </Button>
      </Card>

      {/* Results Section */}
      {extractedText && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Extracted Text</h3>
            <p className="text-sm text-slate-600 mb-4">
              Review and edit the extracted text before saving
            </p>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={15}
              className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Extracted text will appear here..."
            />
          </div>

          {/* Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="format" className="text-slate-900 font-medium">
                Output Format
              </Label>
              <Select value={saveFormat} onValueChange={(v: any) => setSaveFormat(v)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="searchable_pdf">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Searchable PDF</span>
                      <span className="text-xs text-slate-600">Maintains original look with searchable text</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="txt">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Plain Text (.txt)</span>
                      <span className="text-xs text-slate-600">Simple text file</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case" className="text-slate-900 font-medium">
                Save to Case (Optional)
              </Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger id="case">
                  <SelectValue placeholder="Select case..." />
                </SelectTrigger>
                <SelectContent>
                  {cases?.items.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {/* FIXED: case_number → caseNumber, efiling_number → efilingNumber */}
                      {c.caseNumber || c.efilingNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download {saveFormat === "txt" ? "Text" : "PDF"}
                </>
              )}
            </Button>

            <Button 
              onClick={handleSaveToCase} 
              variant="outline" 
              disabled={!selectedCase || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Case
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
