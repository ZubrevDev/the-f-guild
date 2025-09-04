'use client'

import { useState, useEffect } from 'react'
import CharacterSheet from '@/components/player/CharacterSheet'
import DatabaseStatusChecker from '@/components/DatabaseStatusChecker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PlayerData {
  character: {
    id: string
    name: string
    class: string
    level: number
    experience: number
    maxExperience: number
    avatar: string
    coins: { gold: number; silver: number; bronze: number }
    stats: {
      completedQuests: number
      totalGold: number
      currentStreak: number
      achievements: number
    }
    activeTitle?: string
    guild: any
    user: any
  }
  activeEffects: Array<{
    id: string
    name: string
    type: string
    icon: string
    description: string
    duration: number
    maxDuration: number
    effects: any
    restrictions?: any
    bonuses?: any
    reason?: string
  }>
  recentActivity: Array<{
    id: string
    type: 'quest_completed' | 'achievement_unlocked' | 'level_up' | 'effect_gained' | 'purchase_made'
    title: string
    description: string
    timestamp: string
    icon: string
    metadata?: any
  }>
  availableQuests: Array<{
    id: string
    title: string
    description: string
    type: string
    difficulty: number
    rewards: { exp: number; bronze: number; silver: number; gold: number }
    status: string
  }>
}

export default function PlayerDashboard() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Используем правильный ID персонажа из базы данных
  const characterId = 'char-alice' // ID персонажа Алисы из seed

  useEffect(() => {
    fetchPlayerData()
    const interval = setInterval(fetchPlayerData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPlayerData = async () => {
    try {
      setError(null)
      
      console.log('Fetching character data for:', characterId)
      
      // Fetch character data
      const characterResponse = await fetch(`/api/character?characterId=${characterId}`)
      if (!characterResponse.ok) {
        const errorData = await characterResponse.json()
        throw new Error(errorData.error || `HTTP ${characterResponse.status}`)
      }
      const characterData = await characterResponse.json()

      console.log('Character data received:', characterData)

      if (!characterData.data || !characterData.data.character) {
        throw new Error('Invalid character data received')
      }

      // Fetch available quests
      const questsResponse = await fetch(`/api/quests?guildId=${characterData.data.character.guild.id}&status=AVAILABLE`)
      if (!questsResponse.ok) {
        console.warn('Failed to fetch quests, using empty array')
      }
      
      let questsData = { quests: [] }
      try {
        if (questsResponse.ok) {
          questsData = await questsResponse.json()
        }
      } catch (e) {
        console.warn('Error parsing quests response:', e)
      }

      setPlayerData({
        character: characterData.data.character,
        activeEffects: characterData.data.activeEffects || [],
        recentActivity: (characterData.data.recentActivity || []).map((activity: any) => ({
          ...activity,
          type: activity.type.toLowerCase()
        })),
        availableQuests: (questsData.data?.quests || questsData.quests || []).slice(0, 3) // Show only first 3 for preview
      })

    } catch (error) {
      console.error('Error fetching player data:', error)
      setError(error instanceof Error ? error.message : 'Ошибка загрузки данных игрока')
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quest_completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'achievement_unlocked': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'level_up': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'effect_gained': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'purchase_made': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Только что'
    if (diffInHours < 24) return `${diffInHours} ч. назад`
    return `${Math.floor(diffInHours / 24)} дн. назад`
  }

  const handleAcceptQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'accept', 
          characterId 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept quest')
      }

      toast.success('Квест принят!')
      fetchPlayerData() // Refresh data
    } catch (error) {
      console.error('Error accepting quest:', error)
      toast.error('Ошибка при принятии квеста')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">⚔️ Загружаем профиль персонажа...</div>
          <div className="text-sm text-slate-400">ID персонажа: {characterId}</div>
        </div>
      </div>
    )
  }

  if (error || !playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto py-8">
          {/* Show database status checker when there's an error */}
          <DatabaseStatusChecker />
          
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-400 text-xl mb-4">❌ {error || 'Ошибка загрузки'}</div>
            <div className="text-sm text-slate-400 mb-4">
              Попытка загрузки персонажа с ID: {characterId}
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Обновить страницу
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  fetchPlayerData()
                }}
              >
                Попробовать снова
              </Button>
            </div>
            <div className="mt-4 text-xs text-slate-500 p-3 bg-slate-800 rounded">
              <div>Отладочная информация:</div>
              <div>• Убедитесь, что база данных инициализирована</div>
              <div>• Запустите: <code>npm run fix-db</code></div>
              <div>• Проверьте: <code>npm run db:check</code></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8">
        {/* Character Sheet */}
        <CharacterSheet 
          character={playerData.character}
          activeEffects={playerData.activeEffects}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">📈 Недавняя активность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {playerData.recentActivity.length > 0 ? playerData.recentActivity.map((activity) => (
                  <div key={activity.id} className={`flex items-center gap-4 p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{activity.title}</h4>
                      <p className="text-sm text-slate-300">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-slate-400">Пока нет активности</p>
                    <p className="text-sm text-slate-500 mt-2">Выполняйте квесты, чтобы увидеть здесь свои достижения!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access & Featured Quests */}
          <div className="space-y-6">
            {/* Quick Access */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🚀 Быстрый доступ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="/player/quests">🎯 Просмотреть квесты</a>
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a href="/player/shop">🛒 Открыть магазин</a>
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <a href="/player/achievements">🏆 Достижения</a>
                </Button>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                  <a href="/player/inventory">🎒 Инвентарь</a>
                </Button>
              </CardContent>
            </Card>

            {/* Featured Quests */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">⭐ Рекомендуемые квесты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {playerData.availableQuests.length > 0 ? playerData.availableQuests.map((quest) => (
                  <div key={quest.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-white text-sm">{quest.title}</h4>
                      <div className="flex">
                        {Array.from({ length: quest.difficulty }).map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">⭐</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{quest.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 text-xs">
                        <span className="text-blue-300">⭐ {quest.rewards?.exp || 0}</span>
                        {quest.rewards?.bronze > 0 && <span className="text-orange-300">🥉 {quest.rewards.bronze}</span>}
                        {quest.rewards?.silver > 0 && <span className="text-gray-300">🥈 {quest.rewards.silver}</span>}
                        {quest.rewards?.gold > 0 && <span className="text-yellow-300">🥇 {quest.rewards.gold}</span>}
                      </div>
                      <Button 
                        size="sm" 
                        className="text-xs h-6"
                        onClick={() => handleAcceptQuest(quest.id)}
                      >
                        Взять
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-slate-400 text-sm">Нет доступных квестов</p>
                  </div>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <a href="/player/quests">Все квесты →</a>
                </Button>
              </CardContent>
            </Card>

            {/* Daily Tip */}
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">💡</div>
                  <h4 className="font-bold text-yellow-300">Совет дня</h4>
                </div>
                <p className="text-sm text-yellow-100">
                  Выполняйте ежедневные квесты каждый день, чтобы поддерживать стрик и получать дополнительные бонусы!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
