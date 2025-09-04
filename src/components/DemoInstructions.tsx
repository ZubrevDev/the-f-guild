'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Eye, User, Crown } from 'lucide-react'
import { toast } from 'sonner'

export default function DemoInstructions() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Скопировано в буфер обмена!')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-slate-800/95 backdrop-blur border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Демо-режим
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Тестовые данные для входа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-white">Гилд-мастер:</span>
            </div>
            <div className="bg-slate-700 p-2 rounded text-xs font-mono">
              <div className="text-slate-300">Email: demo@example.com</div>
              <div className="text-slate-300">Пароль: demo123</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-xs border-slate-600"
              onClick={() => copyToClipboard('demo@example.com')}
            >
              <Copy className="w-3 h-3 mr-1" />
              Копировать email
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white">Игрок:</span>
            </div>
            <div className="bg-slate-700 p-2 rounded text-xs font-mono">
              <div className="text-slate-300">Код гильдии: ABC123</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-xs border-slate-600"
              onClick={() => copyToClipboard('ABC123')}
            >
              <Copy className="w-3 h-3 mr-1" />
              Копировать код
            </Button>
          </div>

          <Badge className="w-full justify-center text-xs bg-green-500/20 text-green-300">
            Все данные демонстрационные
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}