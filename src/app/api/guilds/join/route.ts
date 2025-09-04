import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ 
        error: 'Код гильдии обязателен' 
      }, { status: 400 })
    }

    // Найти гильдию по коду
    const guild = await prisma.guild.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!guild) {
      return NextResponse.json({ error: 'Неверный код гильдии' }, { status: 404 })
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверить, не состоит ли уже в гильдии
    if (user.guildId) {
      return NextResponse.json({ error: 'Вы уже состоите в гильдии' }, { status: 400 })
    }

    // Присоединить к гильдии
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { guildId: guild.id }
    })

        // Создать персонажа если его нет
    let character = await prisma.character.findFirst({
      where: { 
        userId: user.id,
        guildId: guild.id 
      }
    })

    if (!character) {
      character = await prisma.character.create({
        data: {
          userId: user.id,
          guildId: guild.id,
          name: user.name || 'Новый игрок',
          level: 1,
          experience: 0,
          bronzeCoins: 0,
          silverCoins: 0,
          goldCoins: 0
        }
      })
    }

    // Обновить счетчик участников гильдии
    await prisma.guild.update({
      where: { id: guild.id },
      data: {
        memberCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        code: guild.code
      },
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        experience: character.experience,
        bronzeCoins: character.bronzeCoins,
        silverCoins: character.silverCoins,
        goldCoins: character.goldCoins
      }
    })

  } catch (error) {
    console.error('Guild join error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
        avatar: character.avatar,
        level: character.level
      },
      guild: {
        id: guild.id,
        name: guild.name,
        code: guild.code
      }
    })

  } catch (error) {
    console.error('Error joining guild:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}