import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  console.log('API: GET /api/characters called')
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get('guildId')
    
    console.log('API: guildId:', guildId)
    
    if (!guildId) {
      console.log('API: No guildId provided for characters')
      return ApiResponseBuilder.error('Guild ID is required', 400)
    }

    const characters = await prisma.character.findMany({
      where: {
        guildId: guildId,
        user: {
          role: 'PLAYER' // Исключаем персонажей гильдмастеров
        }
      },
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
            name: true
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { experience: 'desc' }
      ]
    })

    const charactersResponse = characters.map(character => ({
      id: character.id,
      name: character.name,
      class: character.class,
      avatar: character.avatar,
      level: character.level,
      experience: character.experience,
      maxExperience: character.maxExperience,
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
      isOnline: character.isOnline,
      lastActive: character.lastActive.toISOString(),
      activeTitle: character.activeTitle,
      user: character.user,
      guild: character.guild
    }))

    console.log('API: Characters response:', charactersResponse.length, 'characters found')
    return ApiResponseBuilder.success({ characters: charactersResponse })
  } catch (error) {
    console.error('API: Error in GET /api/characters:', error)
    return ApiResponseBuilder.error('Failed to fetch characters', 500)
  }
}
