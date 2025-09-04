export interface Player {
  id: string
  name: string
  class: string
  level: number
  experience: number
  maxExperience: number
  avatar: string
  status: 'online' | 'offline'
  activeEffects: Array<{
    name: string
    type: 'blessing' | 'curse' | 'buff' | 'debuff'
    duration: number
  }>
  coins: {
    gold: number
    silver: number
    bronze: number
  }
  todayQuests: number
}

export interface GuildStats {
  totalPlayers: number
  activeQuests: number
  pendingApproval: number
  completedToday: number
  totalExperience: number
  guildLevel: number
  guildExperience: number
  maxGuildExperience: number
}

export interface ActivityItem {
  id: string
  type: 'quest_completed' | 'level_up' | 'effect_applied'
  message: string
  time: string
  actionRequired?: boolean
}
