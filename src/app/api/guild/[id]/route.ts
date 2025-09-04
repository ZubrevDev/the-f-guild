import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const guildId = id

    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            updatedAt: true // используем updatedAt как lastLoginAt
          }
        }
      }
    })

    if (!guild) {
      return ApiResponseBuilder.error('Guild not found', 404)
    }

    // Подсчитываем активных игроков (обновлялись в последние 7 дней)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activePlayers = guild.users.filter(user => 
      user.updatedAt && user.updatedAt > sevenDaysAgo
    ).length

    const guildData = {
      id: guild.id,
      name: guild.name,
      code: guild.code,
      memberCount: guild.users.length, // реальное количество участников
      activePlayers: activePlayers
    }

    return ApiResponseBuilder.success(guildData)

  } catch (error) {
    console.error('Guild API error:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const guildId = id
    const body = await request.json()

    // Проверяем, что гильдия существует
    const existingGuild = await prisma.guild.findUnique({
      where: { id: guildId }
    })

    if (!existingGuild) {
      return ApiResponseBuilder.error('Guild not found', 404)
    }

    // Подготавливаем данные для обновления
    const updateData: {
      name?: string;
      code?: string;
      description?: string;
    } = {}
    
    if (body.name) {
      updateData.name = body.name
    }
    
    if (body.code) {
      updateData.code = body.code
    }
    
    if (body.description) {
      updateData.description = body.description
    }

    // Обновляем гильдию
    const updatedGuild = await prisma.guild.update({
      where: { id: guildId },
      data: updateData
    })

    return ApiResponseBuilder.success({
      id: updatedGuild.id,
      name: updatedGuild.name,
      code: updatedGuild.code,
      description: updatedGuild.description
    })

  } catch (error) {
    console.error('Guild PATCH API error:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
