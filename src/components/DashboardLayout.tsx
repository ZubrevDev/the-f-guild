'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Target, 
  Users, 
  Sparkles, 
  Store, 
  Settings, 
  LogOut,
  Crown,
  Menu,
  X,
  Sword,
  Trophy,
  Backpack,
  ShoppingCart,
  Castle
} from 'lucide-react'

interface PlayerData {
  name: string
  level?: number
  characterClass?: string
  avatar?: string
  achievements?: {
    gold: number
    silver: number
    bronze: number
  }
}

interface GuildData {
  name: string
  code?: string
  memberCount?: number
  activePlayers?: number
}

interface NotificationCounts {
  quests?: number
  inventory?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'dm' | 'player'
  playerData?: PlayerData
  guildData?: GuildData
  notifications?: NotificationCounts
}

export default function DashboardLayout({ 
  children, 
  userRole,
  playerData,
  guildData,
  notifications
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const dmNavigation = [
    { name: 'Обзор', href: '/dm', icon: Home },
    { name: 'Квесты', href: '/dm/quests', icon: Target },
    { name: 'Игроки', href: '/dm/players', icon: Users },
    { name: 'Эффекты', href: '/dm/effects', icon: Sparkles },
    { name: 'Магазин', href: '/dm/shop', icon: Store },
    { name: 'Настройки', href: '/dm/settings', icon: Settings },
  ]

  const playerNavigation = [
    { name: 'Персонаж', href: '/player', icon: Sword },
    { name: 'Квесты', href: '/player/quests', icon: Target },
    { name: 'Магазин', href: '/player/shop', icon: ShoppingCart },
    { name: 'Достижения', href: '/player/achievements', icon: Trophy },
    { name: 'Инвентарь', href: '/player/inventory', icon: Backpack },
    { name: 'Гильдия', href: '/guild', icon: Castle },
  ]

  const navigation = userRole === 'dm' ? dmNavigation : playerNavigation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                userRole === 'dm' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}>
                {userRole === 'dm' ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Sword className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">The F Guild</h1>
                <p className="text-xs text-slate-400">
                  {userRole === 'dm' ? 'Guildmaster Panel' : 'Adventurer Panel'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? userRole === 'dm'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.name}</span>
                  {/* Dynamic notification badges */}
                  {item.name === 'Квесты' && notifications?.quests && (
                    <Badge className={`ml-auto text-xs ${
                      userRole === 'dm' 
                        ? 'bg-yellow-500/20 text-yellow-300' 
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {notifications.quests}
                    </Badge>
                  )}
                  {item.name === 'Инвентарь' && notifications?.inventory && (
                    <Badge className="ml-auto bg-orange-500/20 text-orange-300 text-xs">
                      {notifications.inventory}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Guild Info */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-4">
              {userRole === 'dm' ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Код гильдии:</span>
                    <Badge className="bg-purple-500/20 text-purple-300 font-mono">
                      {guildData?.code || 'Загрузка...'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    Поделитесь этим кодом с детьми для присоединения к гильдии
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Гильдия:</span>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {guildData?.name || 'Без гильдии'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    {guildData?.memberCount ? `${guildData.memberCount} участников` : 'Данные загружаются...'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            {userRole === 'player' && playerData && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{playerData.avatar || '�'}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{playerData.name}</div>
                    <div className="text-xs text-slate-400">
                      {playerData.level && playerData.characterClass
                        ? `Уровень ${playerData.level} • ${playerData.characterClass}`
                        : 'Загрузка данных персонажа...'
                      }
                    </div>
                  </div>
                </div>
                {playerData.achievements && (
                  <div className="flex gap-2 mt-2">
                    {playerData.achievements.gold > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                        🥇 {playerData.achievements.gold}
                      </Badge>
                    )}
                    {playerData.achievements.silver > 0 && (
                      <Badge className="bg-gray-500/20 text-gray-300 text-xs">
                        🥈 {playerData.achievements.silver}
                      </Badge>
                    )}
                    {playerData.achievements.bronze > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                        🥉 {playerData.achievements.bronze}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            {/* Guild info in top bar */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{guildData?.name || 'Загрузка...'}</p>
                <p className="text-xs text-slate-400">
                  {userRole === 'dm' 
                    ? (guildData?.activePlayers ? `${guildData.activePlayers} активных игроков` : 'Данные загружаются...')
                    : 'Участник гильдии'
                  }
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                userRole === 'dm' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}>
                {userRole === 'dm' ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <Sword className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
