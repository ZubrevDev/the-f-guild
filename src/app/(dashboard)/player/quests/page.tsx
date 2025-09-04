'use client'

import { useState, useEffect } from 'react'
import QuestBoard from '@/components/player/QuestBoard'
import { toast } from 'sonner'

interface Quest {
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
}

interface Effect {
  id: string
  type: string
  effects: any
  restrictions?: any
  bonuses?: any
}

export default function PlayerQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [activeEffects, setActiveEffects] = useState<Effect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // В реальном приложении это будет браться из сессии  
  const characterId = 'char-alice' // ID персонажа Алисы
  const guildId = 'guild-1' // ID гильдии

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      
      // Fetch character data to get effects
      const characterResponse = await fetch(`/api/character?characterId=${characterId}`)
      if (!characterResponse.ok) {
        throw new Error('Failed to fetch character data')
      }
      const characterData = await characterResponse.json()
      setActiveEffects(characterData.activeEffects)

      // Fetch all quests for the guild
      const questsResponse = await fetch(`/api/quests?guildId=${guildId}`)
      if (!questsResponse.ok) {
        throw new Error('Failed to fetch quests')
      }
      const questsData = await questsResponse.json()
      
      // Check API response structure
      console.log('Quests API response:', questsData)
      
      // Extract quests from API response
      const questsArray = questsData.success && questsData.data ? questsData.data.quests : questsData.quests || []
      
      // Transform quests to match component expectations
      const transformedQuests = questsArray.map((quest: any) => ({
        ...quest,
        status: quest.status.toLowerCase(),
        type: quest.type.toLowerCase()
      }))
      
      setQuests(transformedQuests)

    } catch (error) {
      console.error('Error fetching quests:', error)
      setError('Ошибка загрузки квестов')
      toast.error('Ошибка загрузки квестов')
    } finally {
      setLoading(false)
    }
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

      // Update local state
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'in_progress' as const, assignedTo: characterId }
          : quest
      ))

      toast.success('Квест принят!')
    } catch (error) {
      console.error('Error accepting quest:', error)
      toast.error('Ошибка при принятии квеста')
    }
  }

  const handleCompleteQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'complete', 
          characterId 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete quest')
      }

      // Update local state
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'completed' as const }
          : quest
      ))

      toast.success('Квест отправлен на проверку!')
    } catch (error) {
      console.error('Error completing quest:', error)
      toast.error('Ошибка при завершении квеста')
    }
  }

  const handleAbandonQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'abandon', 
          characterId 
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to abandon quest')
      }

      // Update local state
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status: 'available' as const, assignedTo: undefined }
          : quest
      ))

      toast.warning('Квест отменен')
    } catch (error) {
      console.error('Error abandoning quest:', error)
      toast.error('Ошибка при отмене квеста')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">🎯 Загружаем квесты...</div>
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
        <QuestBoard
          quests={quests}
          activeEffects={activeEffects}
          onAcceptQuest={handleAcceptQuest}
          onCompleteQuest={handleCompleteQuest}
          onAbandonQuest={handleAbandonQuest}
        />
      </div>
    </div>
  )
}
