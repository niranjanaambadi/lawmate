// src/app/(dashboard)/ocr/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Download, FileText } from "lucide-react"
import { toast } from "sonner"

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // const handleUpload = async () => {
  //   if (!file) return
    
  //   setIsProcessing(true)
  //   const formData = new FormData()
  //   formData.append("file", file)

  //   try {
  //     const res = await fetch("/api/v1/ocr/extract", {
  //       method: "POST",
  //       body: formData,
  //     })
  //     const data = await res.json()
  //     setExtractedText(data.text)
  //     toast.success("OCR completed")
  //   } catch (error) {
  //     toast.error("OCR failed")
  //   } finally {
  //     setIsProcessing(false)
  //   }
  // }
  const handleUpload = async () => {
  if (!file) return
  
  setIsProcessing(true)
  const formData = new FormData()
  formData.append("file", file)

  try {
    // Get token from session
    const session = await fetch("/api/auth/session").then(r => r.json())
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr/extract`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session?.accessToken}` // Add auth
      },
      body: formData,
    })
    
    if (!res.ok) throw new Error("OCR failed")
    
    const data = await res.json()
    setExtractedText(data.text)
    toast.success("OCR completed")
  } catch (error) {
    console.error(error) // Check console for error
    toast.error("OCR failed")
  } finally {
    setIsProcessing(false)
  }
  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file?.name || "document"}_ocr.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        OCR Document
      </h1>

      <Card className="p-6">
        <Input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button onClick={handleUpload} disabled={!file || isProcessing} className="mt-4">
          <FileText className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : "Extract Text"}
        </Button>
      </Card>

      {extractedText && (
        <Card className="p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">Extracted Text</h3>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          <textarea
            value={extractedText}
            readOnly
            rows={20}
            className="w-full p-4 border rounded-lg font-mono text-sm"
          />
        </Card>
      )}
    </div>
  )
}
