'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUserData = useCallback(async () => {
    // Предотвращаем одновременные вызовы
    if (isLoading) {
      console.log('useUserSession: Already loading, skipping')
      return
    }

    try {
      console.log('useUserSession: Starting fetchUserData')
      setIsLoading(true)
      setUserData(prev => ({ ...prev, loading: true, error: null }))

      // Получаем данные пользователя
      console.log('useUserSession: Fetching user session')
      const userResponse = await fetch('/api/auth/session')
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }
      const userResult = await userResponse.json()
      const user = userResult.data?.user

      if (!user) {
        throw new Error('User data not found')
      }

      console.log('useUserSession: User data received:', user)

      let character = null
      let guild = null
      let notifications = {}

      // Получаем данные персонажа если пользователь - игрок
      if (user.role === 'PLAYER') {
        try {
          console.log('useUserSession: Fetching character data for player')
          const characterResponse = await fetch(`/api/character?userId=${user.id}`)
          if (characterResponse.ok) {
            const characterResult = await characterResponse.json()
            character = characterResult.data
            console.log('useUserSession: Character data received:', character)
          }
        } catch (error) {
          console.warn('Failed to fetch character data:', error)
        }
      }

      // Получаем данные гильдии если у пользователя есть guildId
      if (user.guildId) {
        try {
          console.log('useUserSession: Fetching guild data for guildId:', user.guildId)
          const guildResponse = await fetch(`/api/guild/${user.guildId}`)
          if (guildResponse.ok) {
            const guildResult = await guildResponse.json()
            guild = guildResult.data
            console.log('useUserSession: Guild data received:', guild)
          }
        } catch (error) {
          console.warn('Failed to fetch guild data:', error)
        }
      }

      // Получаем уведомления
      if (user.guildId) {
        try {
          console.log('useUserSession: Fetching notifications')
          const notificationsResponse = await fetch(`/api/notifications?userId=${user.id}&guildId=${user.guildId}`)
          if (notificationsResponse.ok) {
            const notificationsResult = await notificationsResponse.json()
            notifications = notificationsResult.data || {}
            console.log('useUserSession: Notifications received:', notifications)
          }
        } catch (error) {
          console.warn('Failed to fetch notifications:', error)
        }
      }

      console.log('useUserSession: Setting final user data')
      setUserData({
        user,
        character,
        guild,
        notifications,
        loading: false,
        error: null
      })
      setHasInitialized(true)

    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
      setHasInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // Таймаут для принудительного завершения загрузки
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userData.loading && !hasInitialized && !isLoading) {
        console.warn('useUserSession: Loading timeout, forcing completion')
        setUserData(prev => ({
          ...prev,
          loading: false,
          error: 'Loading timeout'
        }))
        setHasInitialized(true)
      }
    }, 10000) // 10 секунд

    return () => clearTimeout(timeout)
  }, [userData.loading, hasInitialized, isLoading])

  useEffect(() => {
    console.log('useUserSession: Effect triggered, status:', status, 'session:', !!session, 'hasInitialized:', hasInitialized, 'isLoading:', isLoading)
    
    if (status === 'loading') {
      console.log('useUserSession: Session still loading')
      return
    }

    if (status === 'unauthenticated' || !session) {
      console.log('useUserSession: Not authenticated')
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: 'Not authenticated'
      }))
      setHasInitialized(true)
      return
    }

    // Загружаем данные только один раз
    if (!hasInitialized && !isLoading && session) {
      console.log('useUserSession: Fetching user data for first time')
      fetchUserData()
    } else if (hasInitialized) {
      console.log('useUserSession: Already initialized, skipping')
    } else if (isLoading) {
      console.log('useUserSession: Currently loading, skipping')
    }
  }, [session, status, fetchUserData, hasInitialized, isLoading])

  return userData
}
