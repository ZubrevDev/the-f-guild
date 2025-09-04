import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  console.log('API: GET /api/effects called')
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get('guildId')
    const characterId = searchParams.get('characterId')
    
    console.log('API: guildId:', guildId, 'characterId:', characterId)
    
    if (!guildId && !characterId) {
      return ApiResponseBuilder.error('Guild ID or Character ID is required', 400)
    }

    if (characterId) {
      // Получить эффекты конкретного персонажа
      const effects = await prisma.effect.findMany({
        where: {
          characterId: characterId,
          duration: { gt: 0 } // Только активные эффекты
        },
        include: {
          character: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      })

      const effectsResponse = effects.map(effect => ({
        id: effect.id,
        name: effect.name,
        description: effect.description,
        type: effect.type.toLowerCase(),
        icon: effect.icon,
        duration: effect.duration,
        maxDuration: effect.maxDuration,
        multipliers: effect.multipliers,
        restrictions: effect.restrictions,
        bonuses: effect.bonuses,
        reason: effect.reason,
        character: effect.character,
        createdAt: effect.createdAt.toISOString(),
        isActive: effect.duration > 0
      }))

      console.log('API: Character effects response:', effectsResponse.length, 'effects found')
      return ApiResponseBuilder.success({ effects: effectsResponse })
    } else {
      // Получить все эффекты всех персонажей гильдии
      if (!guildId) {
        return ApiResponseBuilder.error('Guild ID is required', 400)
      }
      
      const effects = await prisma.effect.findMany({
        where: {
          character: {
            guildId: guildId
          }
        },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              guildId: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      })

      const effectsResponse = effects.map(effect => ({
        id: effect.id,
        name: effect.name,
        description: effect.description,
        type: effect.type.toLowerCase(),
        icon: effect.icon,
        duration: effect.duration,
        maxDuration: effect.maxDuration,
        multipliers: effect.multipliers,
        restrictions: effect.restrictions,
        bonuses: effect.bonuses,
        reason: effect.reason,
        character: effect.character,
        createdAt: effect.createdAt.toISOString(),
        isActive: effect.duration > 0
      }))

      console.log('API: Guild effects response:', effectsResponse.length, 'effects found')
      return ApiResponseBuilder.success({ effects: effectsResponse })
    }
  } catch (error) {
    console.error('API: Error in GET /api/effects:', error)
    return ApiResponseBuilder.error('Failed to fetch effects', 500)
  }
}

export async function POST(request: NextRequest) {
  console.log('API: POST /api/effects called')
  try {
    const body = await request.json()
    const { 
      characterId, 
      name, 
      description, 
      type, 
      icon, 
      duration, 
      multipliers,
      restrictions,
      bonuses,
      reason 
    } = body

    console.log('API: Creating effect for character:', characterId)

    // Валидация обязательных полей
    if (!characterId || !name || !type) {
      return ApiResponseBuilder.error('Character ID, name, and type are required', 400)
    }

    // Валидация типа эффекта
    const validTypes = ['BLESSING', 'CURSE', 'BUFF', 'DEBUFF', 'DISEASE']
    const effectType = type.toUpperCase()
    if (!validTypes.includes(effectType)) {
      return ApiResponseBuilder.error(`Invalid effect type. Must be one of: ${validTypes.join(', ')}`, 400)
    }

    const effect = await prisma.effect.create({
      data: {
        characterId,
        name,
        description: description || '',
        type: effectType as 'BLESSING' | 'CURSE' | 'BUFF' | 'DEBUFF' | 'DISEASE',
        icon: icon || '✨',
        duration: duration || 7, // По умолчанию 7 дней
        maxDuration: duration || 7,
        multipliers: multipliers || null,
        restrictions: restrictions || null,
        bonuses: bonuses || null,
        reason: reason || null
      },
      include: {
        character: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const effectResponse = {
      id: effect.id,
      name: effect.name,
      description: effect.description,
      type: effect.type.toLowerCase(),
      icon: effect.icon,
      duration: effect.duration,
      maxDuration: effect.maxDuration,
      multipliers: effect.multipliers,
      restrictions: effect.restrictions,
      bonuses: effect.bonuses,
      reason: effect.reason,
      character: effect.character,
      createdAt: effect.createdAt.toISOString(),
      isActive: true
    }

    console.log('API: Effect created successfully:', effect.id)
    return ApiResponseBuilder.success({ effect: effectResponse }, 'Effect created successfully')

  } catch (error) {
    console.error('API: Error creating effect:', error)
    return ApiResponseBuilder.error('Failed to create effect', 500)
  }
}

export async function DELETE(request: NextRequest) {
  console.log('API: DELETE /api/effects called')
  try {
    const { searchParams } = new URL(request.url)
    const effectId = searchParams.get('id')
    
    if (!effectId) {
      return ApiResponseBuilder.error('Effect ID is required', 400)
    }

    console.log('API: Deleting effect:', effectId)

    // Проверяем, существует ли эффект
    const effect = await prisma.effect.findUnique({
      where: { id: effectId }
    })

    if (!effect) {
      return ApiResponseBuilder.error('Effect not found', 404)
    }

    await prisma.effect.delete({
      where: { id: effectId }
    })

    console.log('API: Effect deleted successfully:', effectId)
    return ApiResponseBuilder.success({}, 'Effect deleted successfully')

  } catch (error) {
    console.error('API: Error deleting effect:', error)
    return ApiResponseBuilder.error('Failed to delete effect', 500)
  }
}
