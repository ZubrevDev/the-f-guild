import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Название гильдии обязательно' }, { status: 400 })
    }

    // Check if user already has a guild
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { guild: true }
    })

    if (existingUser?.guild) {
      return NextResponse.json({ error: 'Пользователь уже состоит в гильдии' }, { status: 400 })
    }

    // Generate unique code
    let code = generateGuildCode()
    let isUnique = false
    
    while (!isUnique) {
      const existing = await prisma.guild.findUnique({
        where: { code }
      })
      if (!existing) {
        isUnique = true
      } else {
        code = generateGuildCode()
      }
    }

    // Create user if doesn't exist
    let user = existingUser
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role: 'GUILDMASTER'
        }
      })
    } else {
      // Update role to GUILDMASTER
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'GUILDMASTER' }
      })
    }

    // Create guild
    const guild = await prisma.guild.create({
      data: {
        name,
        description,
        code,
        ownerId: user.id,
        memberCount: 1
      }
    })

    // Update user with guild
    await prisma.user.update({
      where: { id: user.id },
      data: { guildId: guild.id }
    })

    // Create default rewards for the guild
    const defaultRewards = [
      {
        name: '30 минут телефона',
        description: 'Дополнительное время с любимыми играми',
        icon: '📱',
        silverCost: 3,
        category: 'screen_time'
      },
      {
        name: '1 час игр',
        description: 'Время для любимых видеоигр',
        icon: '🎮',
        goldCost: 1,
        category: 'screen_time'
      },
      {
        name: '1 евро',
        description: 'Реальные деньги на карманные расходы',
        icon: '💰',
        goldCost: 1,
        category: 'money'
      },
      {
        name: 'Поход в кино',
        description: 'Семейный поход в кинотеатр',
        icon: '🍿',
        goldCost: 3,
        category: 'activity'
      },
      {
        name: 'Поздний отбой',
        description: 'Лечь спать на час позже',
        icon: '🛏️',
        bronzeCost: 10,
        category: 'privilege'
      },
      {
        name: 'Выбор ужина',
        description: 'Выбрать, что будем есть на ужин',
        icon: '🍕',
        bronzeCost: 5,
        category: 'privilege'
      }
    ]

    await prisma.reward.createMany({
      data: defaultRewards.map(reward => ({
        ...reward,
        guildId: guild.id
      }))
    })

    return NextResponse.json({
      guild: {
        id: guild.id,
        name: guild.name,
        code: guild.code,
        description: guild.description
      }
    })

  } catch (error) {
    console.error('Error creating guild:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Код гильдии обязателен' }, { status: 400 })
    }

    const guild = await prisma.guild.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        name: true,
        description: true,
        memberCount: true,
        code: true
      }
    })

    if (!guild) {
      return NextResponse.json({ error: 'Гильдия не найдена' }, { status: 404 })
    }

    return NextResponse.json(guild)

  } catch (error) {
    console.error('Guild search error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}