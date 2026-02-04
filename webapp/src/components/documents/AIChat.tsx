"use client"

import { useAIChat } from "@/lib/hooks/useAIChat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { Sparkles, Send, Trash2, User, Bot } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils/cn"

interface AIChatProps {
  documentId: string
}

export function AIChat({ documentId }: AIChatProps) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, isLoading, clearMessages } = useAIChat(documentId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    sendMessage(input)
    setInput("")
  }

  const suggestedQuestions = [
    "Summarize this document",
    "What are the key legal points?",
    "Extract all dates and deadlines",
    "Who are the parties involved?",
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                AI Document Assistant
              </h3>
              <p className="text-xs text-slate-600">Powered by Claude 3.5</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">
                Ask me anything about this document
              </h4>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                I can help you understand, summarize, and extract information from this PDF.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Suggested Questions
              </p>
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-slate-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[85%]",
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.role === "user"
                        ? "text-indigo-200"
                        : "text-slate-500"
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-2 bg-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          AI responses may contain errors. Always verify important information.
        </p>
      </form>
    </div>
  )
}