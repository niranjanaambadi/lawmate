import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '@/lib/api/analysis'
import type { ChatMessage } from '@/types/analysis'

export function useAIChat(documentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) =>
      analysisApi.chat({
        document_id: documentId,
        message,
        conversation_history: messages,
      }),
    onSuccess: (data, message) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        },
      ])
    },
  })

  const clearMessages = () => setMessages([])

  return {
    messages,
    sendMessage,
    isLoading: isPending,
    clearMessages,
  }
}