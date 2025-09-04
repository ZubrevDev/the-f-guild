'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'quests' | 'streaks' | 'progression' | 'special' | 'legendary'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  reward: {
    exp: number
    coins: { gold: number; silver: number; bronze: number }
    title?: string
  }
}

export default function PlayerAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // В реальном приложении это будет браться из сессии
  const characterId = 'char-alice' // ID персонажа Алисы из базы

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setError(null)
      
      const response = await fetch(`/api/character?characterId=${characterId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch character data')
      }
      
      const data = await response.json()
      setAchievements(data.achievements)

    } catch (error) {
      console.error('Error fetching achievements:', error)
      setError('Ошибка загрузки достижений')
      toast.error('Ошибка загрузки достижений')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quests': return 'bg-green-500/20 text-green-300'
      case 'streaks': return 'bg-orange-500/20 text-orange-300'
      case 'progression': return 'bg-blue-500/20 text-blue-300'
      case 'special': return 'bg-purple-500/20 text-purple-300'
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quests': return '🎯'
      case 'streaks': return '🔥'
      case 'progression': return '📈'
      case 'special': return '✨'
      case 'legendary': return '👑'
      default: return '🏆'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  // Проверяем что achievements загружены
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-white">Загрузка достижений...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  // Используем пустой массив если achievements еще не загружены
  const safeAchievements = achievements || []

  const filteredAchievements = safeAchievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false
    if (showUnlockedOnly && !achievement.unlocked) return false
    return true
  })

  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = []
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  const stats = {
    total: safeAchievements.length,
    unlocked: safeAchievements.filter(a => a.unlocked).length,
    common: safeAchievements.filter(a => a.rarity === 'common' && a.unlocked).length,
    rare: safeAchievements.filter(a => a.rarity === 'rare' && a.unlocked).length,
    epic: safeAchievements.filter(a => a.rarity === 'epic' && a.unlocked).length,
    legendary: safeAchievements.filter(a => a.rarity === 'legendary' && a.unlocked).length,
  }

  const completionPercentage = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">🏆 Загружаем достижения...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Достижения</h1>
          <p className="text-slate-300">Ваши подвиги и награды</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">📊 Прогресс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Завершено</span>
                    <span className="text-white font-bold">{stats.unlocked}/{stats.total}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="text-center text-sm text-slate-400 mt-1">{completionPercentage}%</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Обычные:</span>
                    <span className="text-white">{stats.common}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Редкие:</span>
                    <span className="text-white">{stats.rare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Эпические:</span>
                    <span className="text-white">{stats.epic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-300">Легендарные:</span>
                    <span className="text-white">{stats.legendary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🔍 Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Категория</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      <SelectItem value="quests">🎯 Квесты</SelectItem>
                      <SelectItem value="streaks">🔥 Стрики</SelectItem>
                      <SelectItem value="progression">📈 Прогресс</SelectItem>
                      <SelectItem value="special">✨ Особые</SelectItem>
                      <SelectItem value="legendary">👑 Легендарные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Только открытые</label>
                  <Switch 
                    checked={showUnlockedOnly}
                    onCheckedChange={setShowUnlockedOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Latest Achievement */}
            {stats.unlocked > 0 && (
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-300">🆕 Последнее достижение</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latestAchievement = achievements
                      .filter(a => a.unlocked && a.unlockedAt)
                      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())[0]
                    
                    if (latestAchievement) {
                      return (
                        <div className="text-center">
                          <div className="text-3xl mb-2">{latestAchievement.icon}</div>
                          <h4 className="font-bold text-yellow-300 mb-1">{latestAchievement.name}</h4>
                          <p className="text-xs text-yellow-100">{formatDate(latestAchievement.unlockedAt)}</p>
                        </div>
                      )
                    }
                    return null
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {Object.keys(groupedAchievements).length === 0 ? (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {showUnlockedOnly ? 'Нет открытых достижений' : 'Нет достижений'}
                  </h3>
                  <p className="text-slate-400">
                    {showUnlockedOnly 
                      ? 'Выполняйте квесты, чтобы получить свои первые достижения!'
                      : 'Измените фильтры, чтобы увидеть достижения.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span className="capitalize">
                        {category === 'quests' && 'Квесты'}
                        {category === 'streaks' && 'Стрики'}
                        {category === 'progression' && 'Прогресс'}
                        {category === 'special' && 'Особые'}
                        {category === 'legendary' && 'Легендарные'}
                      </span>
                    </h2>
                    
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {categoryAchievements.map((achievement) => (
                        <Card 
                          key={achievement.id} 
                          className={`bg-white/10 backdrop-blur border-white/20 transition-all ${
                            achievement.unlocked ? 'ring-2 ring-yellow-500/50' : 'opacity-75'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
                                    {achievement.name}
                                  </h3>
                                  {achievement.unlocked && (
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                      ✓
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2 mb-2">
                                  <Badge className={getRarityColor(achievement.rarity)}>
                                    {achievement.rarity}
                                  </Badge>
                                  <Badge className={getCategoryColor(achievement.category)}>
                                    {achievement.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 mb-3">{achievement.description}</p>
                            
                            {/* Progress */}
                            <div className="mb-3">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-slate-400">Прогресс</span>
                                <span className="text-xs text-slate-300">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.maxProgress) * 100} 
                                className="h-2"
                              />
                            </div>
                            
                            {/* Rewards */}
                            <div className="bg-black/20 rounded-lg p-3 mb-3">
                              <h4 className="text-xs font-bold text-slate-300 mb-2">Награды:</h4>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {achievement.reward.exp > 0 && (
                                  <Badge variant="secondary">⭐ {achievement.reward.exp} опыта</Badge>
                                )}
                                {achievement.reward.coins.bronze > 0 && (
                                  <Badge variant="secondary">🥉 {achievement.reward.coins.bronze}</Badge>
                                )}
                                {achievement.reward.coins.silver > 0 && (
                                  <Badge variant="secondary">🥈 {achievement.reward.coins.silver}</Badge>
                                )}
                                {achievement.reward.coins.gold > 0 && (
                                  <Badge variant="secondary">🥇 {achievement.reward.coins.gold}</Badge>
                                )}
                                {achievement.reward.title && (
                                  <Badge className="bg-yellow-500/20 text-yellow-300">
                                    👑 {achievement.reward.title}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {achievement.unlocked && achievement.unlockedAt && (
                              <div className="text-xs text-green-400 text-center">
                                Получено: {formatDate(achievement.unlockedAt)}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
