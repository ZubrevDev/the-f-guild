'use client'

import { useState, useEffect } from 'react'
import { useUserSession } from '@/hooks/useUserSession'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Search,
  Crown,
  Shield,
  Star,
  Eye,
  Settings,
  UserPlus,
  Ban,
  Gift
} from 'lucide-react'

interface Player {
  id: string
  name: string
  email: string
  class: string
  level: number
  experience: number
  maxExperience: number
  avatar: string
  status: 'online' | 'offline'
  joinedAt: string
  lastActive: string
  activeEffects: Array<{
    id: string
    name: string
    type: 'blessing' | 'curse' | 'buff' | 'debuff'
    duration: number
  }>
  coins: {
    gold: number
    silver: number
    bronze: number
  }
  stats: {
    totalQuests: number
    completedQuests: number
    currentStreak: number
  }
}

export default function PlayersPage() {
  const { user, guild, loading: sessionLoading } = useUserSession()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [showRewardDialog, setShowRewardDialog] = useState(false)
  const [showEffectDialog, setShowEffectDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Обработчики действий с игроками
  const handleGiveReward = async () => {
    setShowRewardDialog(true)
  }

  const handleApplyEffect = async () => {
    setShowEffectDialog(true)
  }

  const handleBlockPlayer = async (playerId: string) => {
    const confirmed = window.confirm('Вы уверены, что хотите заблокировать этого игрока?')
    if (!confirmed) return

    setActionLoading(true)
    try {
      // Реальный API запрос для блокировки
      const response = await fetch(`/api/players/${playerId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Обновляем состояние игрока локально
        setPlayers(prevPlayers => 
          prevPlayers.map(p => 
            p.id === playerId 
              ? { ...p, status: 'offline' as const }
              : p
          )
        )
        alert('Игрок успешно заблокирован!')
        setShowPlayerDialog(false)
      } else {
        throw new Error('Не удалось заблокировать игрока')
      }
    } catch (error) {
      console.error('Ошибка при блокировке игрока:', error)
      alert('Ошибка при блокировке игрока. Попробуйте позже.')
    } finally {
      setActionLoading(false)
    }
  }

  // Функция выдачи конкретной награды
  const giveRewardToPlayer = async (playerId: string, rewardType: string, amount: number) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/players/${playerId}/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: rewardType, amount })
      })

      if (response.ok) {
        // Обновляем монеты игрока
        setPlayers(prevPlayers => 
          prevPlayers.map(p => {
            if (p.id === playerId) {
              const updatedCoins = { ...p.coins }
              if (rewardType === 'gold') updatedCoins.gold += amount
              else if (rewardType === 'silver') updatedCoins.silver += amount
              else if (rewardType === 'bronze') updatedCoins.bronze += amount
              return { ...p, coins: updatedCoins }
            }
            return p
          })
        )
        setSelectedPlayer(prev => prev ? {
          ...prev,
          coins: {
            ...prev.coins,
            [rewardType]: prev.coins[rewardType as keyof typeof prev.coins] + amount
          }
        } : null)
        alert(`Игроку выдано: ${amount} ${rewardType === 'gold' ? 'золота' : rewardType === 'silver' ? 'серебра' : 'бронзы'}!`)
        setShowRewardDialog(false)
      } else {
        throw new Error('Не удалось выдать награду')
      }
    } catch (error) {
      console.error('Ошибка при выдаче награды:', error)
      alert('Ошибка при выдаче награды. Попробуйте позже.')
    } finally {
      setActionLoading(false)
    }
  }

  // Функция применения эффекта
  const applyEffectToPlayer = async (playerId: string, effectType: string, duration: number) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/players/${playerId}/effect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: effectType, duration })
      })

      if (response.ok) {
        const newEffect = {
          id: Date.now().toString(),
          name: effectType,
          type: effectType as 'blessing' | 'curse' | 'buff' | 'debuff',
          duration
        }
        
        // Обновляем эффекты игрока
        setPlayers(prevPlayers => 
          prevPlayers.map(p => 
            p.id === playerId 
              ? { ...p, activeEffects: [...p.activeEffects, newEffect] }
              : p
          )
        )
        setSelectedPlayer(prev => prev ? {
          ...prev,
          activeEffects: [...prev.activeEffects, newEffect]
        } : null)
        alert(`Эффект "${effectType}" применен к игроку на ${duration} минут!`)
        setShowEffectDialog(false)
      } else {
        throw new Error('Не удалось применить эффект')
      }
    } catch (error) {
      console.error('Ошибка при применении эффекта:', error)
      alert('Ошибка при применении эффекта. Попробуйте позже.')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    console.log('Players page: useEffect triggered')
    // Загружаем данные игроков из API
    const fetchPlayers = async () => {
      console.log('Players page: Starting to fetch players')
      setLoading(true)
      try {
        // Проверяем, есть ли guild из useUserSession
        if (!guild?.id) {
          console.log('Players page: No guild found')
          setLoading(false)
          return
        }
        
        console.log('Players page: Fetching from API with guildId:', guild.id)
        
        const response = await fetch(`/api/characters?guildId=${guild.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch players')
        }
        
        const result = await response.json()
        console.log('Players page: API response:', result)
        
        if (result.success && result.data && result.data.characters) {
          // Преобразуем данные персонажей в формат Player для этой страницы
          const playersData = result.data.characters.map((char: {
            id: string
            name: string
            class: string
            level: number
            experience: number
            maxExperience: number
            avatar?: string
            isOnline: boolean
            lastActive: string
            coins?: { gold: number; silver: number; bronze: number }
            stats?: { completedQuests: number; currentStreak: number }
            user?: { email: string; createdAt: string }
          }) => ({
            id: char.id,
            name: char.name,
            email: char.user?.email || 'email@example.com',
            class: char.class,
            level: char.level,
            experience: char.experience,
            maxExperience: char.maxExperience,
            avatar: char.avatar || '👤',
            status: char.isOnline ? 'online' : 'offline',
            joinedAt: char.user?.createdAt || new Date().toISOString(),
            lastActive: char.lastActive || new Date().toISOString(),
            activeEffects: [], // Пока пустой массив, можно добавить логику эффектов
            coins: {
              gold: char.coins?.gold || 0,
              silver: char.coins?.silver || 0,
              bronze: char.coins?.bronze || 0
            },
            stats: {
              totalQuests: char.stats?.completedQuests || 0,
              completedQuests: char.stats?.completedQuests || 0,
              currentStreak: char.stats?.currentStreak || 0
            }
          }))
          
          setPlayers(playersData)
        } else {
          console.log('Players page: No characters found or API error')
          setPlayers([])
        }
        
      } catch (error) {
        console.error('Players page: Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    console.log('Players page: Calling fetchPlayers')
    fetchPlayers()
  }, [guild?.id])

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return status === 'online' 
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const getEffectColor = (type: string) => {
    const colors = {
      blessing: 'bg-blue-500/20 text-blue-300',
      curse: 'bg-red-500/20 text-red-300',
      buff: 'bg-green-500/20 text-green-300',
      debuff: 'bg-orange-500/20 text-orange-300'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300'
  }

  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка игроков...</p>
          </div>
        </div>
      
    )
  }

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Управление игроками</h1>
            <p className="text-muted-foreground">
              Просмотр и управление участниками гильдии
            </p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Пригласить игрока
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего игроков</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {players.filter(p => p.status === 'online').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний уровень</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {players.length > 0 
                  ? Math.round(players.reduce((sum, p) => sum + p.level, 0) / players.length)
                  : 0
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, классу или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Список игроков */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                      {player.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{player.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{player.class}</Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(player.status)}`}
                        >
                          {player.status === 'online' ? 'В сети' : 'Не в сети'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{player.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        console.log('👁️ Открытие модального окна для игрока:', player)
                        setSelectedPlayer(player)
                        setShowPlayerDialog(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Прогресс уровня */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Уровень {player.level}</span>
                      <span>{player.experience}/{player.maxExperience} XP</span>
                    </div>
                    <Progress 
                      value={(player.experience / player.maxExperience) * 100} 
                      className="h-1.5"
                    />
                  </div>

                  {/* Монеты */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">🥇</span>
                      <span>{player.coins.gold}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">🥈</span>
                      <span>{player.coins.silver}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-600">🥉</span>
                      <span>{player.coins.bronze}</span>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Квестов: {player.stats.completedQuests}/{player.stats.totalQuests}</span>
                    <span>Серия: {player.stats.currentStreak}</span>
                  </div>

                  {/* Активные эффекты */}
                  {player.activeEffects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {player.activeEffects.slice(0, 3).map((effect) => (
                        <Badge 
                          key={effect.id}
                          variant="outline"
                          className={`text-xs ${getEffectColor(effect.type)}`}
                        >
                          {effect.name}
                          {player.activeEffects.length > 3 && effect === player.activeEffects[2] && (
                            <span className="ml-1">+{player.activeEffects.length - 3}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Диалог детальной информации об игроке */}
        <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Детали игрока</DialogTitle>
              <DialogDescription>
                Подробная информация и управление игроком
              </DialogDescription>
            </DialogHeader>
            {selectedPlayer ? (
              <div className="space-y-4">
                {/* Профиль игрока */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {selectedPlayer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{selectedPlayer.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{selectedPlayer.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{selectedPlayer.class}</Badge>
                      <Badge variant="outline">Уровень {selectedPlayer.level}</Badge>
                    </div>
                  </div>
                </div>

                {/* Статистика в компактном формате */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <h4 className="font-medium text-base">Активность</h4>
                    <p className="text-muted-foreground">
                      Присоединился: {selectedPlayer.joinedAt}
                    </p>
                    <p className="text-muted-foreground">
                      Последняя активность: {selectedPlayer.lastActive}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium text-base">Достижения</h4>
                    <p>Выполнено квестов: <span className="font-medium">{selectedPlayer.stats.completedQuests}</span></p>
                    <p>Текущая серия: <span className="font-medium">{selectedPlayer.stats.currentStreak}</span></p>
                  </div>
                </div>

                {/* Активные эффекты */}
                {selectedPlayer.activeEffects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Активные эффекты</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlayer.activeEffects.map((effect) => (
                        <Badge 
                          key={effect.id}
                          variant="outline"
                          className={`text-xs ${getEffectColor(effect.type)}`}
                        >
                          {effect.name} ({effect.duration}м)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопки действий */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (selectedPlayer) {
                          handleGiveReward()
                        }
                      }}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Выдать награду
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (selectedPlayer) {
                          handleApplyEffect()
                        }
                      }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Применить эффект
                    </Button>
                  </div>
                  <Button 
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (selectedPlayer) {
                        handleBlockPlayer(selectedPlayer.id)
                      }
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Блокируем...' : 'Заблокировать игрока'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Игрок не выбран
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог выдачи награды */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Выдать награду</DialogTitle>
              <DialogDescription>
                Выберите тип и количество награды для игрока {selectedPlayer?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && giveRewardToPlayer(selectedPlayer.id, 'gold', 50)}
                >
                  <span className="text-2xl mb-1">🥇</span>
                  <span className="text-sm">50 золота</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && giveRewardToPlayer(selectedPlayer.id, 'silver', 100)}
                >
                  <span className="text-2xl mb-1">🥈</span>
                  <span className="text-sm">100 серебра</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && giveRewardToPlayer(selectedPlayer.id, 'bronze', 200)}
                >
                  <span className="text-2xl mb-1">🥉</span>
                  <span className="text-sm">200 бронзы</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && giveRewardToPlayer(selectedPlayer.id, 'gold', 100)}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Большая награда
                </Button>
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && giveRewardToPlayer(selectedPlayer.id, 'gold', 25)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Бонус за старание
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог применения эффекта */}
        <Dialog open={showEffectDialog} onOpenChange={setShowEffectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Применить эффект</DialogTitle>
              <DialogDescription>
                Выберите эффект для игрока {selectedPlayer?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 h-auto text-green-600 border-green-200"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && applyEffectToPlayer(selectedPlayer.id, 'Благословение удачи', 60)}
                >
                  <span className="text-xl mb-1">🍀</span>
                  <span className="text-xs">Благословение удачи</span>
                  <span className="text-xs text-muted-foreground">60 мин</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 h-auto text-blue-600 border-blue-200"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && applyEffectToPlayer(selectedPlayer.id, 'Энергия', 30)}
                >
                  <span className="text-xl mb-1">⚡</span>
                  <span className="text-xs">Энергия</span>
                  <span className="text-xs text-muted-foreground">30 мин</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 h-auto text-purple-600 border-purple-200"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && applyEffectToPlayer(selectedPlayer.id, 'Мудрость', 120)}
                >
                  <span className="text-xl mb-1">🧠</span>
                  <span className="text-xs">Мудрость</span>
                  <span className="text-xs text-muted-foreground">120 мин</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 h-auto text-red-600 border-red-200"
                  disabled={actionLoading}
                  onClick={() => selectedPlayer && applyEffectToPlayer(selectedPlayer.id, 'Усталость', 15)}
                >
                  <span className="text-xl mb-1">😴</span>
                  <span className="text-xs">Усталость</span>
                  <span className="text-xs text-muted-foreground">15 мин</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
