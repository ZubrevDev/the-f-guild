import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'
import { getServerSession } from 'next-auth/next'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return ApiResponseBuilder.error('Unauthorized', 401)
    }

    const { email, guildId } = await request.json()

    if (!email || !guildId) {
      return ApiResponseBuilder.error('Email and guildId are required', 400)
    }

    // Проверяем, является ли текущий пользователь гильдмастером этой гильдии
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== 'GUILDMASTER' || currentUser.guildId !== guildId) {
      return ApiResponseBuilder.error('Only guild masters can invite players', 403)
    }

    // Проверяем, существует ли пользователь с таким email
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!invitedUser) {
      return ApiResponseBuilder.error('User with this email does not exist', 404)
    }

    // Проверяем, не состоит ли пользователь уже в гильдии
    if (invitedUser.guildId) {
      return ApiResponseBuilder.error('User is already a member of a guild', 400)
    }

    // Добавляем пользователя в гильдию
    await prisma.user.update({
      where: { id: invitedUser.id },
      data: { 
        guildId: guildId,
        role: 'PLAYER'
      }
    })

    // Создаем персонажа для нового игрока, если у него его еще нет
    const existingCharacter = await prisma.character.findFirst({
      where: { userId: invitedUser.id }
    })

    if (!existingCharacter) {
      await prisma.character.create({
        data: {
          userId: invitedUser.id,
          guildId: guildId,
          name: invitedUser.name || 'Новый игрок',
          class: 'Warrior',
          level: 1,
          experience: 0,
          maxExperience: 100,
          avatar: '⚔️'
        }
      })
    } else {
      // Обновляем существующего персонажа, добавляя его в гильдию
      await prisma.character.update({
        where: { id: existingCharacter.id },
        data: { guildId: guildId }
      })
    }

    return ApiResponseBuilder.success({ message: 'Player invited successfully' })

  } catch (error) {
    console.error('Error inviting player:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
