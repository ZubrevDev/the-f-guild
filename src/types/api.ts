// API Response Types - Стандартные типы для индустрии
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Character Types
export interface CharacterResponse {
  id: string
  name: string
  class: string
  level: number
  experience: number
  maxExperience: number
  avatar: string
  isOnline: boolean
  lastActive: Date
  streak: number
  completedQuests: number
  totalGoldEarned: number
  activeTitle: string | null
  coins: {
    gold: number
    silver: number
    bronze: number
  }
  user: {
    id: string
    name: string | null
    email: string
    role: 'GUILDMASTER' | 'PLAYER'
  }
  guild: {
    id: string
    name: string
    description: string | null
  }
  effects: EffectResponse[]
  quests: QuestResponse[]
  inventoryItems: InventoryItemResponse[]
  achievements: AchievementResponse[]
  recentActivity: ActivityResponse[]
}

// Quest Types
export interface QuestResponse {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special' | 'group' | 'education' | 'physical' | 'creative' | 'family'
  status: 'available' | 'in_progress' | 'completed' | 'approved' | 'expired'
  difficulty: number
  progress: number
  maxProgress: number
  expReward: number
  bronzeReward: number
  silverReward: number
  goldReward: number
  dueDate: Date | null
  startedAt: Date | null
  completedAt: Date | null
  approvedAt: Date | null
  createdAt: Date
  character?: {
    id: string
    name: string
    avatar: string
  }
}

// Reward Types
export interface RewardResponse {
  id: string
  name: string
  description: string
  icon: string
  category: 'entertainment' | 'money' | 'activities' | 'creative' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  price: {
    bronze: number
    silver: number
    gold: number
  }
  availability: 'unlimited' | 'limited'
  stock: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Effect Types
export interface EffectResponse {
  id: string
  name: string
  type: 'blessing' | 'curse' | 'buff' | 'debuff' | 'disease'
  description: string
  icon: string
  duration: number
  maxDuration: number
  multipliers: Record<string, unknown> | null
  restrictions: Record<string, unknown> | null
  bonuses: Record<string, unknown> | null
  reason: string | null
  createdAt: Date
}

// Inventory Types
export interface InventoryItemResponse {
  id: string
  name: string
  description: string
  icon: string
  category: 'reward' | 'title' | 'consumable' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  quantity: number
  usable: boolean
  used: boolean
  obtainedAt: Date
  expiresAt: Date | null
}

// Achievement Types
export interface AchievementResponse {
  id: string
  name: string
  description: string
  icon: string
  category: 'quests' | 'streaks' | 'progression' | 'special' | 'legendary'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt: Date | null
  expReward: number
  bronzeReward: number
  silverReward: number
  goldReward: number
  titleReward: string | null
}

// Activity Types
export interface ActivityResponse {
  id: string
  type: 'quest_completed' | 'achievement_unlocked' | 'level_up' | 'effect_gained' | 'purchase_made' | 'joined_guild'
  title: string
  description: string
  icon: string
  metadata: Record<string, unknown> | null
  createdAt: Date
}

// Request Types
export interface CreateRewardRequest {
  guildId: string
  name: string
  description: string
  icon: string
  category: string
  price: {
    bronze?: number
    silver?: number
    gold?: number
  }
  availability: 'unlimited' | 'limited'
  stock?: number
}

export interface UpdateRewardRequest extends Partial<CreateRewardRequest> {
  id: string
  isActive?: boolean
}

export interface CreateEffectRequest {
  characterId: string
  name: string
  type: string
  description: string
  icon: string
  duration: number
  reason?: string
  multipliers?: Record<string, unknown>
  restrictions?: Record<string, unknown>
  bonuses?: Record<string, unknown>
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}
