'use client'

import {
  GuildHeader,
  StatsCards,
  PlayersOverview,
  QuickActions,
  RecentActivity
} from '@/components/dm/dashboard'
import { useUserSession } from '@/hooks/useUserSession'
import { useState, useEffect } from 'react'

interface ApiCharacter {
  id: string
  name: string
  class: string
  avatar?: string
  level: number
  experience: number
  maxExperience?: number
  isOnline: boolean
  coins?: {
    gold: number
    silver: number
    bronze: number
  }
  user?: any
  guild?: any
}

export default function DMDashboard() {
  const { guild, loading: sessionLoading } = useUserSession()
  const [dashboardData, setDashboardData] = useState({
    stats: { 
      guildLevel: 1, 
      guildExperience: 0,
      totalPlayers: 0,
      activeQuests: 0,
      pendingApproval: 0,
      completedToday: 0,
      totalExperience: 0
    },
    players: [],
    activities: []
  })
  const [loading, setLoading] = useState(true)
  const [hasLoadedData, setHasLoadedData] = useState(false)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (sessionLoading) {
        console.log('DM Dashboard: Session still loading, waiting...')
        return
      }
      
      if (!guild?.id) {
        console.log('DM Dashboard: No guild ID available, setting loading to false')
        setLoading(false)
        return
      }

      // Предотвращаем повторную загрузку данных
      if (hasLoadedData) {
        console.log('DM Dashboard: Data already loaded, skipping')
        return
      }
      
      console.log('DM Dashboard: Loading data for guild:', guild.id)
      setLoading(true)
      
      try {
        // Загружаем данные дашборда для гильдии
        console.log('DM Dashboard: Fetching characters for guild:', guild.id)
        const response = await fetch(`/api/characters?guildId=${guild.id}`)
        const result = await response.json()
        
        console.log('DM Dashboard: Characters API response:', result)
        
        if (result.success && result.data && result.data.characters) {
          // Преобразуем данные из API в формат, ожидаемый компонентом
          const playersData = result.data.characters.map((char: ApiCharacter) => ({
            id: char.id,
            name: char.name,
            class: char.class,
            avatar: char.avatar || '👤',
            level: char.level || 1,
            experience: char.experience || 0,
            maxExperience: char.maxExperience || (char.level * 100) || 100,
            status: char.isOnline ? 'online' : 'offline',
            activeEffects: [], // Пока пустой массив, потом можно загружать из API
            coins: {
              gold: char.coins?.gold || 0,
              silver: char.coins?.silver || 0,
              bronze: char.coins?.bronze || 0
            },
            todayQuests: 0, // Пока 0, потом можно добавить подсчет
            user: char.user,
            guild: char.guild
          }))

          console.log('DM Dashboard: Processed players data:', playersData)

          setDashboardData({
            stats: { 
              guildLevel: 1, 
              guildExperience: 0,
              totalPlayers: playersData.length || 0,
              activeQuests: 0,
              pendingApproval: 0,
              completedToday: 0,
              totalExperience: 0
            },
            players: playersData,
            activities: []
          })
        } else {
          console.log('DM Dashboard: No characters found, setting empty data')
          // Если нет данных, устанавливаем пустые значения
          setDashboardData(prev => ({
            ...prev,
            players: []
          }))
        }
        
        setHasLoadedData(true)
      } catch (error) {
        console.error('Dashboard: Error loading data:', error)
        // В случае ошибки устанавливаем пустые значения
        setDashboardData(prev => ({
          ...prev,
          players: []
        }))
      } finally {
        console.log('DM Dashboard: Loading complete')
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [guild?.id, sessionLoading, hasLoadedData])

  if (sessionLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">
          {sessionLoading ? 'Загрузка сессии...' : 'Загрузка данных гильдии...'}
        </p>
        <button 
          onClick={() => {
            setHasLoadedData(false)
            setLoading(false)
            console.log('Force reset dashboard state')
          }}
          className="text-xs text-blue-500 hover:underline"
        >
          Сбросить состояние загрузки
        </button>
      </div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <GuildHeader
        guildLevel={dashboardData.stats.guildLevel}
        guildExperience={dashboardData.stats.guildExperience}
        maxGuildExperience={1000}
      />

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Players Overview */}
      <PlayersOverview players={dashboardData.players} />

      {/* Quick Actions */}
      <QuickActions stats={dashboardData.stats} />

      {/* Recent Activity */}
      <RecentActivity activities={dashboardData.activities} />
    </div>
  )
}