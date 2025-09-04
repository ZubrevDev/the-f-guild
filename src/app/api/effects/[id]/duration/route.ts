import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * API endpoint для обновления длительности эффекта
 * PUT /api/effects/[id]/duration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('API: PUT /api/effects/[id]/duration called')
  
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return ApiResponseBuilder.error('Unauthorized', 401)
    }
    
    const effectId = params.id
    const body = await request.json()
    const { duration } = body
    
    console.log('API: Updating effect duration:', effectId, 'New duration:', duration)
    
    // Валидация
    if (!effectId) {
      return ApiResponseBuilder.error('Effect ID is required', 400)
    }
    
    if (typeof duration !== 'number' || duration < 0) {
      return ApiResponseBuilder.error('Invalid duration value', 400)
    }
    
    // Проверяем существование эффекта
    const existingEffect = await prisma.effect.findUnique({
      where: { id: effectId }
    })
    
    if (!existingEffect) {
      return ApiResponseBuilder.error('Effect not found', 404)
    }
    
    // Обновляем длительность
    const updatedEffect = await prisma.effect.update({
      where: { id: effectId },
      data: { 
        duration: duration,
        // Если длительность стала 0, эффект считается истекшим
        // но мы не удаляем его из БД для истории
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
    
    // Логируем изменение (пока отключаем из-за типов)
    // if (existingEffect.characterId) {
    //   await prisma.activityLog.create({
    //     data: {
    //       guildId: session.user.guildId as string,
    //       characterId: existingEffect.characterId,
    //       type: 'QUEST_STATUS_CHANGE',
    //       title: 'Длительность эффекта изменена',
    //       description: `${existingEffect.name}: ${existingEffect.duration} → ${duration} дней`,
    //       icon: '⏱️',
    //       metadata: {
    //         effectId: effectId,
    //         oldDuration: existingEffect.duration,
    //         newDuration: duration
    //       }
    //     }
    //   })
    // }
    
    const effectResponse = {
      id: updatedEffect.id,
      name: updatedEffect.name,
      description: updatedEffect.description,
      type: updatedEffect.type.toLowerCase(),
      icon: updatedEffect.icon,
      duration: updatedEffect.duration,
      maxDuration: updatedEffect.maxDuration,
      multipliers: updatedEffect.multipliers,
      restrictions: updatedEffect.restrictions,
      bonuses: updatedEffect.bonuses,
      reason: updatedEffect.reason,
      character: updatedEffect.character,
      createdAt: updatedEffect.createdAt.toISOString(),
      isActive: updatedEffect.duration > 0
    }
    
    console.log('API: Effect duration updated successfully')
    return ApiResponseBuilder.success({ effect: effectResponse }, 'Duration updated successfully')
    
  } catch (error) {
    console.error('API: Error updating effect duration:', error)
    return ApiResponseBuilder.error('Failed to update effect duration', 500)
  }
}