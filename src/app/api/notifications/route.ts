import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const guildId = searchParams.get('guildId')

    if (!userId || !guildId) {
      return ApiResponseBuilder.error('userId and guildId are required', 400)
    }

    // Получаем количество активных квестов
    const activeQuests = await prisma.quest.count({
      where: {
        guildId: guildId,
        status: 'AVAILABLE' // или IN_PROGRESS в зависимости от логики
      }
    })

    // Получаем количество элементов в инвентаре (для игроков)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    let inventoryCount = undefined

    if (user?.role === 'PLAYER') {
      // Подсчитываем количество элементов в инвентаре персонажа
      const character = await prisma.character.findFirst({
        where: { userId: userId }
      })

      if (character) {
        inventoryCount = await prisma.inventoryItem.count({
          where: { characterId: character.id }
        })
      }
    }

    const notifications = {
      quests: activeQuests,
      inventory: inventoryCount
    }

    return ApiResponseBuilder.success(notifications)

  } catch (error) {
    console.error('Notifications API error:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
