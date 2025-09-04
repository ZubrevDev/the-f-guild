import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Generate a unique 6-character guild code
function generateGuildCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, guildName, guildDescription } = await request.json()

    if (!name || !email || !password || !guildName) {
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

    // Генерируем уникальный код гильдии
    let code = generateGuildCode()
    let existingGuild = await prisma.guild.findUnique({ where: { code } })
    
    while (existingGuild) {
      code = generateGuildCode()
      existingGuild = await prisma.guild.findUnique({ where: { code } })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)

    // Транзакция для создания пользователя, гильдии и персонажа
    const result = await prisma.$transaction(async (tx) => {
      // Создаем пользователя
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'GUILDMASTER',
        }
      })

      // Создаем гильдию
      const guild = await tx.guild.create({
        data: {
          name: guildName,
          description: guildDescription || null,
          code,
          ownerId: user.id,
          memberCount: 1
        }
      })

      // Привязываем пользователя к гильдии
      await tx.user.update({
        where: { id: user.id },
        data: { guildId: guild.id }
      })

      // Создаем персонажа гильдмастера
      const character = await tx.character.create({
        data: {
          userId: user.id,
          guildId: guild.id,
          name,
          class: 'guildmaster',
          avatar: '👑',
          level: 1,
          experience: 0,
          bronzeCoins: 100,
          silverCoins: 10,
          goldCoins: 1
        }
      })

      return { user, guild, character }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name
      },
      guild: {
        id: result.guild.id,
        name: result.guild.name,
        code: result.guild.code,
        description: result.guild.description
      },
      character: {
        id: result.character.id,
        name: result.character.name
      }
    })

  } catch (error) {
    console.error('Guild master creation error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
