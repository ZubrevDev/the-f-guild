import { useState, useEffect } from 'react'
import { Player, GuildStats, ActivityItem } from '../components/dm/dashboard/types'
import { useUserSession } from './useUserSession'

export function useDashboardData() {
  const { guild, loading: sessionLoading } = useUserSession()
  const [stats, setStats] = useState<GuildStats>({
    totalPlayers: 2,
    activeQuests: 8,
    pendingApproval: 3,
    completedToday: 5,
    totalExperience: 4250,
    guildLevel: 3,
    guildExperience: 750,
    maxGuildExperience: 1000
  })

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const [activities] = useState<ActivityItem[]>([])  // Пустой массив активностей

  useEffect(() => {
    const loadPlayers = async () => {
      if (sessionLoading || !guild?.id) return
      
      try {
        console.log('Dashboard: Loading players data...')
        const response = await fetch(`/api/characters?guildId=${guild.id}`)
        const result = await response.json()
        
        console.log('Dashboard: Characters API response:', result)
        console.log('Dashboard: result.success:', result.success)
        console.log('Dashboard: result.data:', result.data)
        console.log('Dashboard: result.data.characters:', result.data?.characters)
        
        if (result.success && result.data && result.data.characters) {
          // Преобразуем данные персонажей в формат Player
          const playersData: Player[] = result.data.characters.map((char: {
            id: string
            name: string
            class: string
            level: number
            experience: number
            avatar?: string
            gold?: number
            silver?: number
            bronze?: number
          }) => ({
            id: char.id,
            name: char.name,
            class: char.class,
            level: char.level,
            experience: char.experience,
            maxExperience: char.level * 100, // Простая формула для макс опыта
            avatar: char.avatar || '👤',
            status: 'online', // По умолчанию онлайн
            activeEffects: [], // Пока пустые эффекты
            coins: {
              gold: char.gold || 0,
              silver: char.silver || 0,
              bronze: char.bronze || 0
            },
            todayQuests: 0 // Пока 0, потом можно добавить подсчет
          }))
          
          console.log('Dashboard: Mapped players:', playersData)
          setPlayers(playersData)
          
          // Обновляем статистику
          setStats(prev => ({
            ...prev,
            totalPlayers: playersData.length
          }))
        } else {
          console.log('Dashboard: No players found from API')
          setPlayers([])
        }
      } catch (error) {
        console.error('Dashboard: Error loading players:', error)
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [guild?.id, sessionLoading])

  return {
    stats,
    players,
    activities,
    loading
  }
}
