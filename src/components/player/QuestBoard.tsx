'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface QuestBoardProps {
  quests: Array<{
    id: string
    title: string
    description: string
    type: string
    difficulty: number
    rewards: { exp: number; bronze: number; silver: number; gold: number }
    status: 'available' | 'in_progress' | 'completed' | 'pending'
    assignedTo?: string
    progress?: number
    maxProgress?: number
    deadline?: string
  }>
  activeEffects: Array<{
    id: string
    type: string
    effects: any
  }>
  onAcceptQuest: (questId: string) => void
  onCompleteQuest: (questId: string) => void
  onAbandonQuest: (questId: string) => void
}

export default function QuestBoard({ 
  quests, 
  activeEffects,
  onAcceptQuest, 
  onCompleteQuest, 
  onAbandonQuest 
}: QuestBoardProps) {
  const [selectedType, setSelectedType] = useState('all')

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'weekly': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'special': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'education': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'physical': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'creative': return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
      case 'family': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '🌅'
      case 'weekly': return '📅'
      case 'special': return '⭐'
      case 'education': return '📚'
      case 'physical': return '💪'
      case 'creative': return '🎨'
      case 'family': return '👨‍👩‍👧‍👦'
      default: return '📋'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '🆓'
      case 'in_progress': return '⏳'
      case 'completed': return '✅'
      case 'pending': return '⏰'
      default: return '📋'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Доступен'
      case 'in_progress': return 'В процессе'
      case 'completed': return 'Выполнен'
      case 'pending': return 'Ожидает проверки'
      default: return 'Неизвестно'
    }
  }

  const checkQuestBlocked = (quest: any) => {
    for (const effect of activeEffects) {
      if (effect.effects?.questTypesBlocked?.includes(quest.type)) {
        return 'Заблокировано эффектом'
      }
      if (effect.effects?.difficultQuestsBlocked && quest.difficulty >= 2) {
        return 'Сложные квесты заблокированы'
      }
    }
    return null
  }

  const calculateRewardModifiers = (quest: any) => {
    let expMultiplier = 1
    let coinMultiplier = 1
    let bonusGold = 0
    
    for (const effect of activeEffects) {
      if (effect.effects?.xpMultiplier) {
        if (!effect.effects?.questTypes || effect.effects.questTypes.includes(quest.type)) {
          expMultiplier *= effect.effects.xpMultiplier
        }
      }
      if (effect.effects?.coinMultiplier) {
        coinMultiplier *= effect.effects.coinMultiplier
      }
      if (effect.effects?.bonusGold) {
        bonusGold += effect.effects.bonusGold
      }
    }
    
    return {
      exp: Math.round(quest.rewards.exp * expMultiplier),
      bronze: Math.round(quest.rewards.bronze * coinMultiplier),
      silver: Math.round(quest.rewards.silver * coinMultiplier),
      gold: Math.round(quest.rewards.gold * coinMultiplier) + bonusGold,
      hasModifiers: expMultiplier !== 1 || coinMultiplier !== 1 || bonusGold > 0
    }
  }

  const filteredQuests = quests.filter(quest => {
    if (selectedType === 'all') return true
    return quest.type === selectedType
  })

  const questsByStatus = {
    available: filteredQuests.filter(q => q.status === 'available'),
    in_progress: filteredQuests.filter(q => q.status === 'in_progress'),
    pending: filteredQuests.filter(q => q.status === 'pending'),
    completed: filteredQuests.filter(q => q.status === 'completed')
  }

  const handleAcceptQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    const blockReason = checkQuestBlocked(quest)
    if (blockReason) {
      toast.error(`❌ ${blockReason}`)
      return
    }

    onAcceptQuest(questId)
    toast.success(`⚔️ Квест "${quest.title}" принят!`)
  }

  const QuestCard = ({ quest }: { quest: any }) => {
    const blocked = checkQuestBlocked(quest)
    const rewards = calculateRewardModifiers(quest)
    const progressPercent = quest.progress && quest.maxProgress ? (quest.progress / quest.maxProgress) * 100 : 0

    return (
      <div className={`p-4 bg-white/5 rounded-lg border border-white/10 transition-all hover:bg-white/10 ${blocked ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getQuestTypeIcon(quest.type)}</span>
              <h3 className="font-bold text-white">{quest.title}</h3>
              <Badge className={getQuestTypeColor(quest.type)}>
                {quest.type.toUpperCase()}
              </Badge>
              <div className="flex">
                {Array.from({ length: quest.difficulty }).map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <Badge variant="outline" className="text-xs">
                {getStatusIcon(quest.status)} {getStatusText(quest.status)}
              </Badge>
            </div>
            <p className="text-sm text-slate-300 mb-3">{quest.description}</p>
            
            {blocked && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                ❌ {blocked}
              </div>
            )}
            
            {quest.progress !== undefined && quest.maxProgress && (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Прогресс</span>
                  <span className="text-white">{quest.progress}/{quest.maxProgress}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-3 text-sm">
            <span className="text-blue-300">⭐ {rewards.exp} опыта</span>
            {rewards.bronze > 0 && <span className="text-orange-300">🥉 {rewards.bronze}</span>}
            {rewards.silver > 0 && <span className="text-gray-300">🥈 {rewards.silver}</span>}
            {rewards.gold > 0 && <span className="text-yellow-300">🥇 {rewards.gold}</span>}
            {rewards.hasModifiers && (
              <Badge variant="outline" className="text-xs text-purple-300">
                🎭 С эффектами
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {quest.status === 'available' && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleAcceptQuest(quest.id)}
                disabled={!!blocked}
              >
                ⚔️ Взять квест
              </Button>
            )}
            {quest.status === 'in_progress' && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onCompleteQuest(quest.id)}
                >
                  ✅ Выполнить
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAbandonQuest(quest.id)}
                >
                  ❌ Отказаться
                </Button>
              </>
            )}
          </div>
        </div>
        
        {quest.deadline && (
          <div className="mt-3 text-xs text-slate-400">
            ⏰ Дедлайн: {quest.deadline}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-8 bg-white/10">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="daily">🌅</TabsTrigger>
          <TabsTrigger value="weekly">📅</TabsTrigger>
          <TabsTrigger value="education">📚</TabsTrigger>
          <TabsTrigger value="physical">💪</TabsTrigger>
          <TabsTrigger value="creative">🎨</TabsTrigger>
          <TabsTrigger value="family">👨‍👩‍👧‍👦</TabsTrigger>
          <TabsTrigger value="special">⭐</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-6">
          {/* Available Quests */}
          {questsByStatus.available.length > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🆓 Доступные квесты ({questsByStatus.available.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questsByStatus.available.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* In Progress Quests */}
          {questsByStatus.in_progress.length > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">⏳ Квесты в процессе ({questsByStatus.in_progress.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questsByStatus.in_progress.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending Quests */}
          {questsByStatus.pending.length > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">⏰ Ожидают проверки ({questsByStatus.pending.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questsByStatus.pending.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completed Quests */}
          {questsByStatus.completed.length > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">✅ Выполненные квесты ({questsByStatus.completed.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questsByStatus.completed.slice(0, 5).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
                {questsByStatus.completed.length > 5 && (
                  <div className="text-center py-4">
                    <Button variant="outline" size="sm">
                      Показать еще {questsByStatus.completed.length - 5} квестов
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredQuests.length === 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">Нет квестов</h3>
                <p className="text-slate-400 mb-4">
                  {selectedType === 'all' 
                    ? 'В этой категории пока нет доступных квестов.'
                    : 'Квестов выбранного типа пока нет.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedType('all')}
                  disabled={selectedType === 'all'}
                >
                  Показать все квесты
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
