'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUserSession } from '@/hooks/useUserSession'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

// Import new components
import QuestFilters from '@/components/dm/quest-filters/QuestFilters'
import CreateQuestDialog from '@/components/dm/quest-creation/CreateQuestDialog'
import QuestList from '@/components/dm/quest-list/QuestList'

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

export default function QuestManagement() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { guild, loading: sessionLoading } = useUserSession()
  const [newQuest, setNewQuest] = useState<NewQuest>({
    title: '',
    description: '',
    type: 'DAILY',
    difficulty: 1,
    rewards: {
      exp: 50,
      bronze: 2,
      silver: 0,
      gold: 0
    },
    guildId: '' // Будет устанавливаться динамически
  })

  const loadData = useCallback(async () => {
    if (sessionLoading || !guild?.id) return

    console.log('Frontend: Starting loadData with guildId:', guild.id)
    try {
      setLoading(true)
      
      // Загружаем квесты для текущей гильдии
      const questsResponse = await fetch(`/api/quests?guildId=${guild.id}`)
      const questsData = await questsResponse.json()
      console.log('Frontend: API response received')
      console.log('Frontend: Response data:', questsData)
      if (questsData.success) {
        console.log('Frontend: Setting quests:', questsData.data.quests.length)
        setQuests(questsData.data.quests)
      } else {
        console.log('Frontend: API returned error:', questsData)
      }

      // Загружаем персонажей текущей гильдии
      const charactersResponse = await fetch(`/api/characters?guildId=${guild.id}`)
      const charactersData = await charactersResponse.json()
      if (charactersData.success) {
        setCharacters(charactersData.data.characters)
      }

    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [guild?.id, sessionLoading])

  // Load data when guild is available
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update newQuest guildId when guild changes
  useEffect(() => {
    if (guild?.id) {
      setNewQuest(prev => ({ ...prev, guildId: guild.id }))
    }
  }, [guild?.id])

  // Улучшенная фильтрация включая игроков
  const filteredQuests = quests.filter(quest => {
    const matchesStatus = filter === 'all' || quest.status.toLowerCase() === filter
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesPlayer = true
    if (selectedPlayer === 'unassigned') {
      matchesPlayer = !quest.assignedTo
    } else if (selectedPlayer !== 'all') {
      matchesPlayer = quest.assignedTo?.id === selectedPlayer
    }
    
    return matchesStatus && matchesSearch && matchesPlayer
  })

  console.log('All quests:', quests.length)
  console.log('Filtered quests:', filteredQuests.length)
  console.log('Filter:', filter)
  console.log('Search term:', searchTerm)
  console.log('Selected player:', selectedPlayer)

  const getQuestionCount = (status: string) => {
    return quests.filter(q => status === 'all' || q.status.toLowerCase() === status).length
  }

  const handleCreateQuest = async () => {
    try {
      if (!newQuest.title || !newQuest.description) {
        toast.error('Заполните название и описание квеста')
        return
      }

      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuest),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Квест успешно создан!')
        setShowCreateDialog(false)
        // Reset form
        setNewQuest({
          title: '',
          description: '',
          type: 'DAILY',
          difficulty: 1,
          rewards: {
            exp: 50,
            bronze: 2,
            silver: 0,
            gold: 0
          },
          guildId: guild?.id || ''
        })
        loadData() // Reload quests
      } else {
        toast.error(data.error || 'Ошибка при создании квеста')
      }
    } catch (error) {
      console.error('Error creating quest:', error)
      toast.error('Ошибка при создании квеста')
    }
  }

  const handleEditQuest = (quest: Quest) => {
    // TODO: Implement quest editing
    toast.info(`Редактирование квеста: ${quest.title}`)
  }

  const handleDeleteQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Квест удален')
        loadData() // Reload quests
      } else {
        toast.error('Ошибка при удалении квеста')
      }
    } catch (error) {
      console.error('Error deleting quest:', error)
      toast.error('Ошибка при удалении квеста')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-300">Загрузка квестов...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Управление квестами</h1>
              <p className="text-blue-200">
                Всего квестов: {quests.length} | Отфильтровано: {filteredQuests.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={loadData}
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              <CreateQuestDialog
                showCreateDialog={showCreateDialog}
                setShowCreateDialog={setShowCreateDialog}
                newQuest={newQuest}
                setNewQuest={setNewQuest}
                onCreateQuest={handleCreateQuest}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <QuestFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        selectedPlayer={selectedPlayer}
        onPlayerChange={setSelectedPlayer}
        characters={characters}
        getQuestionCount={getQuestionCount}
      />

      {/* Quest List */}
      <QuestList
        quests={filteredQuests}
        onEdit={handleEditQuest}
        onDelete={handleDeleteQuest}
      />
    </div>
  )
}
