import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')
    const userId = searchParams.get('userId')
    
    if (!characterId && !userId) {
      return ApiResponseBuilder.error('Character ID or User ID is required', 400)
    }

    // Build where clause based on available parameters
    const whereClause = characterId 
      ? { id: characterId }
      : { userId: userId! }

    // Fetch character with all related data
    const character = await prisma.character.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        guild: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true
          }
        },
        effects: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!character) {
      return ApiResponseBuilder.error('Character not found', 404)
    }

    // Get recent activity for this character
    const recentActivity = await prisma.activityLog.findMany({
      where: { characterId: character.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate achievements based on coins
    const achievements = {
      gold: character.goldCoins || 0,
      silver: character.silverCoins || 0,
      bronze: character.bronzeCoins || 0
    }

    // Format response
    const characterData = {
      id: character.id,
      name: character.name,
      class: character.class,
      level: character.level,
      experience: character.experience,
      maxExperience: character.maxExperience,
      avatar: character.avatar,
      achievements: achievements,
      coins: {
        gold: character.goldCoins,
        silver: character.silverCoins,
        bronze: character.bronzeCoins
      },
      stats: {
        completedQuests: character.completedQuests,
        totalGold: character.totalGoldEarned,
        currentStreak: character.streak
      },
      activeTitle: character.activeTitle,
      guild: character.guild,
      user: character.user
    }

    const activeEffects = character.effects.map(effect => ({
      id: effect.id,
      name: effect.name,
      type: effect.type.toLowerCase(),
      icon: effect.icon,
      description: effect.description,
      duration: effect.duration,
      maxDuration: effect.maxDuration,
      effects: effect.multipliers,
      restrictions: effect.restrictions,
      bonuses: effect.bonuses,
      reason: effect.reason
    }))

    return ApiResponseBuilder.success({
      character: characterData,
      activeEffects,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.createdAt.toISOString(),
        icon: activity.icon,
        metadata: activity.metadata
      }))
    })

  } catch (error) {
    console.error('Error fetching character:', error)
    return ApiResponseBuilder.error('Failed to fetch character data', 500)
  }
}
