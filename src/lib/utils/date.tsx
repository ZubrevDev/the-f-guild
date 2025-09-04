'use client'

import { useEffect, useState } from 'react'

export function useClientSideDate(date: Date | string) {
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      setFormattedDate(dateObj.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }))
    }
  }, [date])

  if (!isClient) {
    return '...' // Показываем плейсхолдер во время SSR
  }

  return formattedDate
}

export function formatDateSafe(date: Date | string): string {
  if (typeof window === 'undefined') {
    // На сервере возвращаем стандартный формат
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
  }
  
  // На клиенте используем локализованный формат
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

interface ClientOnlyDateProps {
  date: Date | string
  prefix?: string
  className?: string
}

export function ClientOnlyDate({ date, prefix = '', className }: ClientOnlyDateProps) {
  const formattedDate = useClientSideDate(date)
  
  return (
    <span className={className}>
      {prefix}{formattedDate}
    </span>
  )
}
