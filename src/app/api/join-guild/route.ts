import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, guildCode } = await request.json()

    if (!name || !email || !password || !guildCode) {
      return NextResponse.json({ 
        error: 'Все поля обязательны' 
      }, { status: 400 })
    }

    // Проверяем, не существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }

    // Ищем гильдию по коду
    const guild = await prisma.guild.findUnique({
      where: { code: guildCode.toUpperCase() }
    })

    if (!guild) {
      return NextResponse.json({ error: 'Гильдия с таким кодом не найдена' }, { status: 404 })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)

    // Транзакция для создания пользователя, привязки к гильдии и персонажа
    const result = await prisma.$transaction(async (tx) => {
      // Создаем пользователя
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'PLAYER',
          guildId: guild.id
        }
      })

      // Создаем персонажа
      const character = await tx.character.create({
        data: {
          userId: user.id,
          guildId: guild.id,
          name,
          class: 'adventurer',
          avatar: '⚔️',
          level: 1,
          experience: 0,
          bronzeCoins: 50,
          silverCoins: 0,
          goldCoins: 0
        }
      })

      // Обновляем счетчик участников гильдии
      await tx.guild.update({
        where: { id: guild.id },
        data: {
          memberCount: {
            increment: 1
          }
        }
      })

      return { user, character }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name
      },
      guild: {
        id: guild.id,
        name: guild.name,
        code: guild.code
      },
      character: {
        id: result.character.id,
        name: result.character.name
      }
    })

  } catch (error) {
    console.error('Player join error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
