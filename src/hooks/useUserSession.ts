'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  role: 'GUILDMASTER' | 'PLAYER'
  guildId: string | null
}

interface Character {
  id: string
  name: string
  class: string
  level: number
  avatar: string | null
  achievements?: {
    gold: number
    silver: number
    bronze: number
  }
}

interface Guild {
  id: string
  name: string
  description?: string
  code: string
  memberCount: number
  activePlayers: number
}

interface NotificationCounts {
  quests?: number
  inventory?: number
}

interface UserSessionData {
  user: User | null
  character: Character | null
  guild: Guild | null
  notifications: NotificationCounts
  loading: boolean
  error: string | null
}

export function useUserSession(): UserSessionData {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserSessionData>({
    user: null,
    character: null,
    guild: null,
    notifications: {},
    loading: true,
    error: null
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session) {
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: 'Not authenticated'
      }))
      return
    }

    fetchUserData()
  }, [session, status])

  const fetchUserData = async () => {
    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }))

      // Получаем данные пользователя
      const userResponse = await fetch('/api/auth/session')
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }
      const userResult = await userResponse.json()
      const user = userResult.data?.user

      if (!user) {
        throw new Error('User data not found')
      }

      let character = null
      let guild = null
      let notifications = {}

      // Получаем данные персонажа если пользователь - игрок
      if (user.role === 'player') {
        try {
          const characterResponse = await fetch(`/api/character?userId=${user.id}`)
          if (characterResponse.ok) {
            const characterResult = await characterResponse.json()
            character = characterResult.data
          }
        } catch (error) {
          console.warn('Failed to fetch character data:', error)
        }
      }

      // Получаем данные гильдии если у пользователя есть guildId
      if (user.guildId) {
        try {
          const guildResponse = await fetch(`/api/guild/${user.guildId}`)
          if (guildResponse.ok) {
            const guildResult = await guildResponse.json()
            guild = guildResult.data
          }
        } catch (error) {
          console.warn('Failed to fetch guild data:', error)
        }
      }

      // Получаем уведомления
      if (user.guildId) {
        try {
          const notificationsResponse = await fetch(`/api/notifications?userId=${user.id}&guildId=${user.guildId}`)
          if (notificationsResponse.ok) {
            const notificationsResult = await notificationsResponse.json()
            notifications = notificationsResult.data || {}
          }
        } catch (error) {
          console.warn('Failed to fetch notifications:', error)
        }
      }

      setUserData({
        user,
        character,
        guild,
        notifications,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  return userData
}
