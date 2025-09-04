'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useUserSession } from '@/hooks/useUserSession'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()
  const { user, character, guild, notifications, loading, error } = useUserSession()

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // Determine user role based on user data
  const userRole = user?.role === 'GUILDMASTER' ? 'dm' : 'player'

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    )
  }

  // Show error state (but don't show error for unauthenticated, as we redirect)
  if (error && status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Ошибка загрузки данных: {error}</div>
      </div>
    )
  }

  // Don't render anything if redirecting
  if (status === 'unauthenticated') {
    return null
  }

  // Prepare player data
  const playerData = character ? {
    name: character.name,
    level: character.level,
    characterClass: character.class,
    avatar: character.avatar || '�',
    achievements: character.achievements
  } : undefined

  // Prepare guild data
  const guildData = guild ? {
    name: guild.name,
    code: guild.code,
    memberCount: guild.memberCount,
    activePlayers: guild.activePlayers
  } : undefined
  
  return (
    <DashboardLayout
      userRole={userRole}
      playerData={playerData}
      guildData={guildData}
      notifications={notifications}
    >
      {children}
    </DashboardLayout>
  )
}
