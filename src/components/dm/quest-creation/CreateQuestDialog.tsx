'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface NewQuest {
  title: string
  description: string
  type: string
  difficulty: number
  rewards: {
    exp: number
    bronze: number
    silver: number
    gold: number
  }
  guildId: string
}

interface CreateQuestDialogProps {
  showCreateDialog: boolean
  setShowCreateDialog: (show: boolean) => void
  newQuest: NewQuest
  setNewQuest: (quest: NewQuest | ((prev: NewQuest) => NewQuest)) => void
  onCreateQuest: () => Promise<void>
}

export default function CreateQuestDialog({
  showCreateDialog,
  setShowCreateDialog,
  newQuest,
  setNewQuest,
  onCreateQuest
}: CreateQuestDialogProps) {
  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Создать квест
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Создать новый квест</DialogTitle>
          <DialogDescription className="text-slate-300">
            Заполните информацию о квесте
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-white">Название</Label>
            <Input
              id="title"
              value={newQuest.title}
              onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Введите название квеста"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">Описание</Label>
            <Textarea
              id="description"
              value={newQuest.description}
              onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white h-24"
              placeholder="Опишите, что нужно сделать"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-white">Тип квеста</Label>
              <Select value={newQuest.type} onValueChange={(value) => setNewQuest(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">🌅 Ежедневный</SelectItem>
                  <SelectItem value="WEEKLY">📅 Еженедельный</SelectItem>
                  <SelectItem value="SPECIAL">⭐ Особый</SelectItem>
                  <SelectItem value="GROUP">👥 Групповой</SelectItem>
                  <SelectItem value="EDUCATION">📚 Образовательный</SelectItem>
                  <SelectItem value="PHYSICAL">💪 Физический</SelectItem>
                  <SelectItem value="CREATIVE">🎨 Творческий</SelectItem>
                  <SelectItem value="FAMILY">👨‍👩‍👧‍👦 Семейный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="difficulty" className="text-white">Сложность</Label>
              <Select 
                value={newQuest.difficulty.toString()} 
                onValueChange={(value) => setNewQuest(prev => ({ ...prev, difficulty: parseInt(value) }))}
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
          
          <div className="grid gap-2">
            <Label className="text-white">Награды</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Опыт</Label>
                <Input
                  type="number"
                  value={newQuest.rewards.exp}
                  onChange={(e) => setNewQuest(prev => ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, exp: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Бронза</Label>
                <Input
                  type="number"
                  value={newQuest.rewards.bronze}
                  onChange={(e) => setNewQuest(prev => ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, bronze: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Серебро</Label>
                <Input
                  type="number"
                  value={newQuest.rewards.silver}
                  onChange={(e) => setNewQuest(prev => ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, silver: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Золото</Label>
                <Input
                  type="number"
                  value={newQuest.rewards.gold}
                  onChange={(e) => setNewQuest(prev => ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, gold: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-slate-700 border-slate-600 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Отменить
          </Button>
          <Button 
            onClick={onCreateQuest}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Создать квест
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
