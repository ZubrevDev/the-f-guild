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

    const { name, email, class: characterClass, avatar, guildId } = await request.json()

    if (!name || !email || !characterClass || !guildId) {
      return ApiResponseBuilder.error('Name, email, class and guildId are required', 400)
    }

    // Проверяем, является ли текущий пользователь гильдмастером этой гильдии
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== 'GUILDMASTER' || currentUser.guildId !== guildId) {
      return ApiResponseBuilder.error('Only guild masters can create players', 403)
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return ApiResponseBuilder.error('User with this email already exists', 400)
    }

    // Создаем нового пользователя
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: 'PLAYER',
        guildId: guildId
      }
    })

    // Создаем персонажа для нового пользователя
    const newCharacter = await prisma.character.create({
      data: {
        userId: newUser.id,
        guildId: guildId,
        name: name,
        class: characterClass,
        level: 1,
        experience: 0,
        maxExperience: 100,
        avatar: avatar || '⚔️'
      }
    })

    return ApiResponseBuilder.success({ 
      message: 'Player created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      character: {
        id: newCharacter.id,
        name: newCharacter.name,
        class: newCharacter.class
      }
    })

  } catch (error) {
    console.error('Error creating player:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
