'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Quest {
  id: string
  title: string
  description: string
  type: string
  difficulty: number
  status: string
  assignedTo?: {
    id: string
    name: string
  }
  rewards: {
    exp: number
    bronze: number
    silver: number
    gold: number
  }
  createdAt: string
}

interface Character {
  id: string
  name: string
  avatar: string
  level: number
}

interface EditQuestDialogProps {
  quest: Quest | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedQuest: Quest) => Promise<void>
  characters: Character[]
}

export default function EditQuestDialog({
  quest,
  isOpen,
  onClose,
  onSave,
  characters
}: EditQuestDialogProps) {
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (quest) {
      setEditingQuest({ ...quest })
    }
  }, [quest])

  const handleSave = async () => {
    if (!editingQuest) return

    try {
      setLoading(true)
      await onSave(editingQuest)
      onClose()
      toast.success('Квест успешно обновлен')
    } catch (error) {
      console.error('Error updating quest:', error)
      toast.error('Ошибка при обновлении квеста')
    } finally {
      setLoading(false)
    }
  }

  if (!quest || !editingQuest) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Редактировать квест</DialogTitle>
          <DialogDescription className="text-slate-300">
            Измените параметры квеста
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title" className="text-white">Название</Label>
            <Input
              id="edit-title"
              value={editingQuest.title}
              onChange={(e) => setEditingQuest(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Введите название квеста"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description" className="text-white">Описание</Label>
            <Textarea
              id="edit-description"
              value={editingQuest.description}
              onChange={(e) => setEditingQuest(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="bg-slate-700 border-slate-600 text-white h-24"
              placeholder="Опишите, что нужно сделать"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type" className="text-white">Тип квеста</Label>
              <Select 
                value={editingQuest.type.toLowerCase()} 
                onValueChange={(value) => setEditingQuest(prev => prev ? { ...prev, type: value.toUpperCase() } : null)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">🌅 Ежедневный</SelectItem>
                  <SelectItem value="weekly">📅 Еженедельный</SelectItem>
                  <SelectItem value="special">⭐ Особый</SelectItem>
                  <SelectItem value="group">👥 Групповой</SelectItem>
                  <SelectItem value="education">📚 Образовательный</SelectItem>
                  <SelectItem value="physical">💪 Физический</SelectItem>
                  <SelectItem value="creative">🎨 Творческий</SelectItem>
                  <SelectItem value="family">👨‍👩‍👧‍👦 Семейный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-difficulty" className="text-white">Сложность</Label>
              <Select 
                value={editingQuest.difficulty.toString()} 
                onValueChange={(value) => setEditingQuest(prev => prev ? { ...prev, difficulty: parseInt(value) } : null)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ Легко</SelectItem>
                  <SelectItem value="2">⭐⭐ Средне</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Сложно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="text-white">Статус</Label>
              <Select 
                value={editingQuest.status.toLowerCase()} 
                onValueChange={(value) => setEditingQuest(prev => prev ? { ...prev, status: value.toUpperCase() } : null)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Доступен</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Выполнен</SelectItem>
                  <SelectItem value="approved">Одобрен</SelectItem>
                  <SelectItem value="expired">Истек</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-assigned" className="text-white">Назначен игроку</Label>
              <Select 
                value={editingQuest.assignedTo?.id || 'unassigned'} 
                onValueChange={(value) => {
                  if (value === 'unassigned') {
                    setEditingQuest(prev => prev ? { ...prev, assignedTo: undefined } : null)
                  } else {
                    const character = characters.find(c => c.id === value)
                    if (character) {
                      setEditingQuest(prev => prev ? { 
                        ...prev, 
                        assignedTo: { id: character.id, name: character.name }
                      } : null)
                    }
                  }
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Не назначен</SelectItem>
                  {Array.isArray(characters) && characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name} (Ур. {character.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label className="text-white">Награды</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Опыт</Label>
                <Input
                  type="number"
                  value={editingQuest.rewards.exp}
                  onChange={(e) => setEditingQuest(prev => prev ? ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, exp: parseInt(e.target.value) || 0 }
                  }) : null)}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Бронза</Label>
                <Input
                  type="number"
                  value={editingQuest.rewards.bronze}
                  onChange={(e) => setEditingQuest(prev => prev ? ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, bronze: parseInt(e.target.value) || 0 }
                  }) : null)}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Серебро</Label>
                <Input
                  type="number"
                  value={editingQuest.rewards.silver}
                  onChange={(e) => setEditingQuest(prev => prev ? ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, silver: parseInt(e.target.value) || 0 }
                  }) : null)}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Золото</Label>
                <Input
                  type="number"
                  value={editingQuest.rewards.gold}
                  onChange={(e) => setEditingQuest(prev => prev ? ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, gold: parseInt(e.target.value) || 0 }
                  }) : null)}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отменить
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
