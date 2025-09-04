'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DatabaseStatus {
  connected: boolean
  users: number
  guilds: number
  characters: number
  quests: number
  effects: number
  lastCheck: string
  error?: string
}

export default function DatabaseStatusChecker() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/status/database')
      const data = await response.json()
      
      if (data.data) {
        setStatus({
          ...data.data,
          lastCheck: new Date().toLocaleString('ru-RU')
        })
      } else {
        setStatus({
          connected: false,
          users: 0,
          guilds: 0,
          characters: 0,
          quests: 0,
          effects: 0,
          lastCheck: new Date().toLocaleString('ru-RU'),
          error: data.error || 'Неизвестная ошибка'
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        users: 0,
        guilds: 0,
        characters: 0,
        quests: 0,
        effects: 0,
        lastCheck: new Date().toLocaleString('ru-RU'),
        error: 'Не удается подключиться к API'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  if (!status) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 Статус базы данных</span>
          <Badge variant={status.connected ? "default" : "destructive"}>
            {status.connected ? "Подключена" : "Ошибка"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.connected ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{status.users}</div>
                <div className="text-muted-foreground">Пользователей</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{status.guilds}</div>
                <div className="text-muted-foreground">Гильдий</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{status.characters}</div>
                <div className="text-muted-foreground">Персонажей</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{status.quests}</div>
                <div className="text-muted-foreground">Квестов</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{status.effects}</div>
                <div className="text-muted-foreground">Эффектов</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-4">
              Последняя проверка: {status.lastCheck}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-red-500">
              ❌ {status.error}
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm">
              <div className="font-bold mb-2">Способы исправления:</div>
              <div className="space-y-1 text-xs">
                <div>1. Запустите: <code>npm run fix-db</code></div>
                <div>2. Или: <code>node init-db.js</code></div>
                <div>3. Проверьте: <code>npm run db:check</code></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={checkDatabaseStatus} 
            disabled={loading}
            size="sm"
          >
            {loading ? "Проверка..." : "Проверить снова"}
          </Button>
          
          {!status.connected && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/DATABASE_FIX_GUIDE.md', '_blank')}
            >
              📖 Руководство
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
