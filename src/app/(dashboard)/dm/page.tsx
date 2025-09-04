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

  useEffect(() => {
    const loadDashboardData = async () => {
      if (sessionLoading || !guild?.id) return
      
      setLoading(true)
      try {
        // Загружаем данные дашборда для гильдии
        const response = await fetch(`/api/characters?guildId=${guild.id}`)
        const result = await response.json()
        
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
          // Если нет данных, устанавливаем пустые значения
          setDashboardData(prev => ({
            ...prev,
            players: []
          }))
        }
      } catch (error) {
        console.error('Dashboard: Error loading data:', error)
        // В случае ошибки устанавливаем пустые значения
        setDashboardData(prev => ({
          ...prev,
          players: []
        }))
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [guild?.id, sessionLoading])

  if (sessionLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      {loading ? (
        <div className="bg-white/5 backdrop-blur border-white/10 rounded-lg p-8 text-center">
          <div className="text-white">Загрузка игроков...</div>
        </div>
      ) : (
        <PlayersOverview players={dashboardData.players} />
      )}

      {/* Quick Actions */}
      <QuickActions stats={dashboardData.stats} />

      {/* Recent Activity */}
      <RecentActivity activities={dashboardData.activities} />
    </div>
  )
}