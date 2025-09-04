'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, CalendarIcon } from 'lucide-react'

interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special' | 'group'
  difficulty: 1 | 2 | 3
  status: 'available' | 'in_progress' | 'pending' | 'completed' | 'expired'
  assignedTo?: string
  assignedToName?: string
  rewards: {
    experience: number
    bronze: number
    silver: number
    gold: number
  }
  dueDate?: string
  createdAt: string
  completedAt?: string
}

interface QuestEditDialogProps {
  quest: Quest | null
  isOpen: boolean
  onClose: () => void
  onSave: (quest: Quest) => void
  players: Array<{ id: string; name: string }>
}

export default function QuestEditDialog({ 
  quest, 
  isOpen, 
  onClose, 
  onSave, 
  players 
}: QuestEditDialogProps) {
  const [editedQuest, setEditedQuest] = useState<Quest | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (quest) {
      setEditedQuest({ ...quest })
    }
  }, [quest])

  const validateQuest = (quest: Quest): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (!quest.title.trim()) {
      errors.title = 'Название квеста обязательно'
    }
    
    if (!quest.description.trim()) {
      errors.description = 'Описание квеста обязательно'
    }
    
    if (quest.rewards.experience < 1) {
      errors.experience = 'Опыт должен быть больше 0'
    }
    
    if (quest.rewards.bronze < 0 || quest.rewards.silver < 0 || quest.rewards.gold < 0) {
      errors.rewards = 'Награды не могут быть отрицательными'
    }
    
    if (quest.dueDate && new Date(quest.dueDate) < new Date()) {
      errors.dueDate = 'Дата окончания не может быть в прошлом'
    }
    
    return errors
  }

  const handleSave = () => {
    if (!editedQuest) return
    
    const validationErrors = validateQuest(editedQuest)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    onSave(editedQuest)
    onClose()
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const updateQuest = (updates: Partial<Quest>) => {
    if (!editedQuest) return
    setEditedQuest({ ...editedQuest, ...updates })
  }

  const updateRewards = (rewardType: keyof Quest['rewards'], value: number) => {
    if (!editedQuest) return
    setEditedQuest({
      ...editedQuest,
      rewards: {
        ...editedQuest.rewards,
        [rewardType]: value
      }
    })
  }

  const getTypeColor = (type: Quest['type']) => {
    const colors = {
      daily: 'bg-blue-500/20 text-blue-300',
      weekly: 'bg-purple-500/20 text-purple-300',
      special: 'bg-yellow-500/20 text-yellow-300',
      group: 'bg-green-500/20 text-green-300'
    }
    return colors[type]
  }

  const getStatusColor = (status: Quest['status']) => {
    const colors = {
      available: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      pending: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      expired: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[status]
  }

  if (!editedQuest) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            Редактирование квеста
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Измените параметры квеста. Все изменения будут сохранены немедленно.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название квеста *</Label>
                <Input
                  id="title"
                  value={editedQuest.title}
                  onChange={(e) => updateQuest({ title: e.target.value })}
                  placeholder="Например: Убрать комнату"
                  className={`bg-slate-700 border-slate-600 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={editedQuest.description}
                  onChange={(e) => updateQuest({ description: e.target.value })}
                  placeholder="Подробное описание задания..."
                  className={`bg-slate-700 border-slate-600 min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                  rows={4}
                />
                {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label>Дата окончания (необязательно)</Label>
                <Input
                  type="date"
                  value={editedQuest.dueDate || ''}
                  onChange={(e) => updateQuest({ dueDate: e.target.value || undefined })}
                  className={`bg-slate-700 border-slate-600 ${errors.dueDate ? 'border-red-500' : ''}`}
                />
                {errors.dueDate && <p className="text-sm text-red-400">{errors.dueDate}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип квеста</Label>
                  <Select 
                    value={editedQuest.type} 
                    onValueChange={(value: Quest['type']) => updateQuest({ type: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="daily">🌅 Ежедневный</SelectItem>
                      <SelectItem value="weekly">📅 Еженедельный</SelectItem>
                      <SelectItem value="special">⭐ Особый</SelectItem>
                      <SelectItem value="group">👥 Групповой</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Сложность</Label>
                  <Select 
                    value={editedQuest.difficulty.toString()} 
                    onValueChange={(value) => updateQuest({ difficulty: parseInt(value) as 1 | 2 | 3 })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="1">⭐ Легко</SelectItem>
                      <SelectItem value="2">⭐⭐ Средне</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Сложно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select 
                    value={editedQuest.status} 
                    onValueChange={(value: Quest['status']) => updateQuest({ status: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="available">🆓 Доступен</SelectItem>
                      <SelectItem value="in_progress">⏳ В процессе</SelectItem>
                      <SelectItem value="pending">⏰ На проверке</SelectItem>
                      <SelectItem value="completed">✅ Завершён</SelectItem>
                      <SelectItem value="expired">❌ Просрочен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Назначить игроку</Label>
                  <Select 
                    value={editedQuest.assignedTo || ''} 
                    onValueChange={(value) => {
                      const player = players.find(p => p.id === value)
                      updateQuest({ 
                        assignedTo: value || undefined,
                        assignedToName: player?.name || undefined
                      })
                    }}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Не назначен" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="">Не назначен</SelectItem>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Текущие значки</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeColor(editedQuest.type)}>
                    {editedQuest.type === 'daily' && '🌅 Ежедневный'}
                    {editedQuest.type === 'weekly' && '📅 Еженедельный'}
                    {editedQuest.type === 'special' && '⭐ Особый'}
                    {editedQuest.type === 'group' && '👥 Групповой'}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(editedQuest.status)}>
                    {editedQuest.status === 'available' && '🆓 Доступен'}
                    {editedQuest.status === 'in_progress' && '⏳ В процессе'}
                    {editedQuest.status === 'pending' && '⏰ На проверке'}
                    {editedQuest.status === 'completed' && '✅ Завершён'}
                    {editedQuest.status === 'expired' && '❌ Просрочен'}
                  </Badge>
                  <Badge variant="outline" className="border-white/20">
                    {'⭐'.repeat(editedQuest.difficulty)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Награды */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Награды</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">⭐ Опыт *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="1"
                  max="1000"
                  value={editedQuest.rewards.experience}
                  onChange={(e) => updateRewards('experience', parseInt(e.target.value) || 0)}
                  className={`bg-slate-700 border-slate-600 ${errors.experience ? 'border-red-500' : ''}`}
                />
                {errors.experience && <p className="text-sm text-red-400">{errors.experience}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bronze">🥉 Бронза</Label>
                <Input
                  id="bronze"
                  type="number"
                  min="0"
                  max="50"
                  value={editedQuest.rewards.bronze}
                  onChange={(e) => updateRewards('bronze', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="silver">🥈 Серебро</Label>
                <Input
                  id="silver"
                  type="number"
                  min="0"
                  max="20"
                  value={editedQuest.rewards.silver}
                  onChange={(e) => updateRewards('silver', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gold">🥇 Золото</Label>
                <Input
                  id="gold"
                  type="number"
                  min="0"
                  max="10"
                  value={editedQuest.rewards.gold}
                  onChange={(e) => updateRewards('gold', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            {errors.rewards && <p className="text-sm text-red-400">{errors.rewards}</p>}
          </div>

          {/* Предварительный просмотр */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Предварительный просмотр</Label>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{editedQuest.title}</h3>
                  <p className="text-slate-300 text-sm">{editedQuest.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Сложность</div>
                  <div>{'⭐'.repeat(editedQuest.difficulty)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">Награды:</span>
                <span className="text-yellow-400">⭐ {editedQuest.rewards.experience} опыта</span>
                {editedQuest.rewards.bronze > 0 && (
                  <span className="text-orange-400">🥉 {editedQuest.rewards.bronze}</span>
                )}
                {editedQuest.rewards.silver > 0 && (
                  <span className="text-gray-400">🥈 {editedQuest.rewards.silver}</span>
                )}
                {editedQuest.rewards.gold > 0 && (
                  <span className="text-yellow-400">🥇 {editedQuest.rewards.gold}</span>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-between pt-6 border-t border-slate-600">
            <div className="text-sm text-slate-400">
              * Поля обязательны для заполнения
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={Object.keys(errors).length > 0}
              >
                💾 Сохранить изменения
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}