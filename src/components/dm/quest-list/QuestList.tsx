'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Users
} from 'lucide-react'

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

interface QuestListProps {
  quests: Quest[]
  onEdit: (quest: Quest) => void
  onDelete: (questId: string) => Promise<void>
}

export default function QuestList({ quests, onEdit, onDelete }: QuestListProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      expired: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-500/20 text-blue-400',
      weekly: 'bg-purple-500/20 text-purple-400',
      special: 'bg-orange-500/20 text-orange-400',
      group: 'bg-green-500/20 text-green-400',
      education: 'bg-cyan-500/20 text-cyan-400',
      physical: 'bg-red-500/20 text-red-400',
      creative: 'bg-pink-500/20 text-pink-400',
      family: 'bg-yellow-500/20 text-yellow-400'
    }
    return colors[type.toLowerCase()] || 'bg-gray-500/20 text-gray-300'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      daily: '🌅',
      weekly: '📅',
      special: '⭐',
      group: '👥',
      education: '📚',
      physical: '💪',
      creative: '🎨',
      family: '👨‍👩‍👧‍👦'
    }
    return icons[type.toLowerCase()] || '🎯'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: 'Ежедневный',
      weekly: 'Еженедельный', 
      special: 'Особый',
      group: 'Групповой',
      education: 'Образовательный',
      physical: 'Физический',
      creative: 'Творческий',
      family: 'Семейный'
    }
    return labels[type.toLowerCase()] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Доступен',
      in_progress: 'В процессе',
      completed: 'Выполнен',
      approved: 'Одобрен',
      expired: 'Истек'
    }
    return labels[status.toLowerCase()] || status
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      available: <Target className="w-4 h-4" />,
      in_progress: <Clock className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      expired: <AlertCircle className="w-4 h-4" />
    }
    return icons[status.toLowerCase()] || <Target className="w-4 h-4" />
  }

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(Math.min(difficulty, 3))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU')
    } catch {
      return dateString
    }
  }

  if (quests.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Квесты не найдены</h3>
          <p className="text-slate-400">Попробуйте изменить фильтры или создать новый квест</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {quests.map((quest) => (
        <Card key={quest.id} className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                  <Badge className={`${getStatusColor(quest.status)} text-xs`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(quest.status)}
                      {getStatusLabel(quest.status)}
                    </span>
                  </Badge>
                </div>
                
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  {quest.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs">
                  <Badge className={getTypeColor(quest.type)}>
                    {getTypeIcon(quest.type)} {getTypeLabel(quest.type)}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>Сложность:</span>
                    <span className="text-yellow-400">{getDifficultyStars(quest.difficulty)}</span>
                  </div>
                  
                  <div className="text-slate-400">
                    Создан: {formatDate(quest.createdAt)}
                  </div>
                  
                  {quest.assignedTo && (
                    <div className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3" />
                      <span>Назначено: {quest.assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(quest)}
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(quest.id)}
                  className="bg-slate-700 border-slate-600 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Rewards */}
            <div className="border-t border-slate-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">НАГРАДЫ:</span>
                <div className="flex items-center gap-3 text-xs">
                  {quest.rewards.exp > 0 && (
                    <span className="text-blue-400">⚡ {quest.rewards.exp} опыта</span>
                  )}
                  {quest.rewards.bronze > 0 && (
                    <span className="text-orange-400">🥉 {quest.rewards.bronze}</span>
                  )}
                  {quest.rewards.silver > 0 && (
                    <span className="text-gray-400">🥈 {quest.rewards.silver}</span>
                  )}
                  {quest.rewards.gold > 0 && (
                    <span className="text-yellow-400">🥇 {quest.rewards.gold}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
