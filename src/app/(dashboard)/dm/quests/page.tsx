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
import EditQuestDialog from '@/components/dm/quest-edit/EditQuestDialog'

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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
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
    if (sessionLoading || !guild?.id) {
      console.log('Frontend: Waiting for guild data...')
      return
    }

    console.log('Frontend: Starting loadData with guildId:', guild.id)
    setLoading(true)

    try {
      // Load quests
      const questsResponse = await fetch(`/api/quests?guildId=${guild.id}`)
      if (!questsResponse.ok) {
        throw new Error(`HTTP error! status: ${questsResponse.status}`)
      }

      const questsResult = await questsResponse.json()
      console.log('Frontend: Quests response:', questsResult)

      if (questsResult.success && questsResult.data && questsResult.data.quests) {
        console.log('Frontend: Setting quests data:', questsResult.data.quests)
        setQuests(questsResult.data.quests)
      } else {
        console.log('Frontend: No quests data found')
        setQuests([])
      }

      // Load characters
      const charactersResponse = await fetch(`/api/characters?guildId=${guild.id}`)
      if (!charactersResponse.ok) {
        throw new Error(`Characters HTTP error! status: ${charactersResponse.status}`)
      }

      const charactersResult = await charactersResponse.json()
      console.log('Frontend: Characters response:', charactersResult)

      if (charactersResult.success && charactersResult.data && charactersResult.data.characters) {
        setCharacters(charactersResult.data.characters)
      } else {
        setCharacters([])
      }

    } catch (error) {
      console.error('Frontend: Error loading data:', error)
      toast.error('Ошибка загрузки данных')
      // В случае ошибки устанавливаем пустые массивы
      setQuests([])
      setCharacters([])
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
  const filteredQuests = (Array.isArray(quests) ? quests : []).filter(quest => {
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

  console.log('All quests:', Array.isArray(quests) ? quests.length : 'not array')
  console.log('Filtered quests:', filteredQuests.length)
  console.log('Filter:', filter)
  console.log('Search term:', searchTerm)
  console.log('Selected player:', selectedPlayer)

  const getQuestionCount = (status: string) => {
    return (Array.isArray(quests) ? quests : []).filter(q => status === 'all' || q.status.toLowerCase() === status).length
  }

  const handleCreateQuest = async () => {
    try {
      console.log('Frontend: Creating quest with data:', newQuest)
      
      if (!newQuest.title || !newQuest.description) {
        toast.error('Заполните название и описание квеста')
        return
      }

      if (!newQuest.guildId) {
        toast.error('Guild ID не установлен')
        return
      }

      console.log('Frontend: Sending POST request to /api/quests')
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuest),
      })

      console.log('Frontend: Create quest response status:', response.status)
      const data = await response.json()
      console.log('Frontend: Create quest response data:', data)
      
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
        console.error('Frontend: Create quest API error:', data.error)
        toast.error(data.error || 'Ошибка при создании квеста')
      }
    } catch (error) {
      console.error('Error creating quest:', error)
      toast.error('Ошибка при создании квеста: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest)
    setShowEditDialog(true)
  }

  const handleSaveEditedQuest = async (updatedQuest: Quest) => {
    try {
      const response = await fetch(`/api/quests/${updatedQuest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedQuest.title,
          description: updatedQuest.description,
          type: updatedQuest.type,
          difficulty: updatedQuest.difficulty,
          status: updatedQuest.status,
          characterId: updatedQuest.assignedTo?.id,
          rewards: updatedQuest.rewards
        }),
      })

      const data = await response.json()
      if (data.success) {
        loadData() // Reload quests
        setShowEditDialog(false)
        setEditingQuest(null)
      } else {
        throw new Error(data.error || 'Failed to update quest')
      }
    } catch (error) {
      console.error('Error updating quest:', error)
      throw error
    }
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

      {/* Edit Quest Dialog */}
      <EditQuestDialog
        quest={editingQuest}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setEditingQuest(null)
        }}
        onSave={handleSaveEditedQuest}
        characters={characters}
      />
    </div>
  )
}
