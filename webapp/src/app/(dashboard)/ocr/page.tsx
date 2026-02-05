"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/hooks/useAuth"

export default function OCRPage() {
  const { session } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or image file (JPG, PNG)')
        return
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      setExtractedText("")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setIsProcessing(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr/extract`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`,
        },
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`OCR failed: ${res.statusText}`)
      }

      const data = await res.json()
      setExtractedText(data.text || "No text extracted")
      toast.success("Text extracted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "OCR processing failed"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!extractedText) return
    
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file?.name.replace(/\.[^/.]+$/, "") || "document"}_ocr.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Downloaded successfully")
  }

  const handleReset = () => {
    setFile(null)
    setExtractedText("")
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          OCR Document
        </h1>
        <p className="text-slate-600 mt-1">
          Extract text from PDF documents and images
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Select File (PDF, JPG, PNG - Max 10MB)
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          {file && (
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-600" />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{file.name}</div>
                  <div className="text-sm text-slate-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
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

            {file && !isProcessing && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {extractedText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Extracted Text</CardTitle>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download TXT
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <textarea
                value={extractedText}
                readOnly
                rows={20}
                className="w-full bg-transparent font-mono text-sm text-slate-900 focus:outline-none resize-none"
                placeholder="Extracted text will appear here..."
              />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              {extractedText.split(/\s+/).length} words • {extractedText.length} characters
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-bold text-blue-900 mb-2">Tips for Best Results</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use clear, high-resolution scans</li>
            <li>• Ensure text is not rotated or skewed</li>
            <li>• PDFs with selectable text work best</li>
            <li>• For scanned documents, use high contrast</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
