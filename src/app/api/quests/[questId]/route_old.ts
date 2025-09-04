import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

interface RouteParams {
  params: {
    questId: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { questId } = params
    const body = await request.json()
    const { action, characterId } = body

    if (!questId || !action) {
      return ApiResponseBuilder.validationError('Quest ID and action are required')
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    })

    if (!quest) {
      return ApiResponseBuilder.notFound('Quest')
    }

    let updatedQuest

    switch (action) {
      case 'accept':
        if (!characterId) {
          return ApiResponseBuilder.validationError('Character ID is required to accept quest')
        }
        
        // Check if character exists
        const character = await prisma.character.findUnique({
          where: { id: characterId }
        })
        
        if (!character) {
          return ApiResponseBuilder.notFound('Character')
        }

        // Update quest status and assign to character
        updatedQuest = await prisma.quest.update({
          where: { id: questId },
          data: {
            status: 'IN_PROGRESS',
            characterId: characterId,
            startedAt: new Date()
          },
          include: {
            character: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            guildId: quest.guildId,
            characterId: characterId,
            type: 'QUEST_COMPLETED', // We'll change this to QUEST_ACCEPTED when we add that type
            title: 'Квест принят',
            description: `Принял квест "${quest.title}"`,
            icon: '🎯',
            metadata: { questId: questId }
          }
        })

        break

      case 'complete':
        if (!characterId) {
          return ApiResponseBuilder.validationError('Character ID is required to complete quest')
        }
        
        updatedQuest = await prisma.quest.update({
          where: { id: questId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          },
          include: {
            character: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            guildId: quest.guildId,
            characterId: characterId,
            type: 'QUEST_COMPLETED',
            title: 'Квест выполнен!',
            description: `Выполнил квест "${quest.title}"`,
            icon: '✅',
            metadata: { 
              questId: questId,
              rewards: {
                exp: quest.expReward,
                bronze: quest.bronzeReward,
                silver: quest.silverReward,
                gold: quest.goldReward
              }
            }
          }
        })

        break

      case 'approve':
        if (quest.status !== 'COMPLETED') {
          return ApiResponseBuilder.validationError('Quest must be completed before approval')
        }

        updatedQuest = await prisma.quest.update({
          where: { id: questId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date()
          },
          include: {
            character: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        })

        // Award rewards to character
        if (quest.characterId) {
          await prisma.character.update({
            where: { id: quest.characterId },
            data: {
              experience: { increment: quest.expReward },
              bronzeCoins: { increment: quest.bronzeReward },
              silverCoins: { increment: quest.silverReward },
              goldCoins: { increment: quest.goldReward },
              completedQuests: { increment: 1 },
              totalGoldEarned: { increment: quest.goldReward }
            }
          })
        }

        break

      case 'abandon':
        if (!characterId) {
          return ApiResponseBuilder.validationError('Character ID is required to abandon quest')
        }
        
        updatedQuest = await prisma.quest.update({
          where: { id: questId },
          data: {
            status: 'AVAILABLE',
            characterId: null,
            startedAt: null,
            completedAt: null
          }
        })

        break

      default:
        return ApiResponseBuilder.validationError('Invalid action')
    }

    const questResponse = {
      id: updatedQuest.id,
      title: updatedQuest.title,
      description: updatedQuest.description,
      type: updatedQuest.type.toLowerCase(),
      status: updatedQuest.status.toLowerCase(),
      difficulty: updatedQuest.difficulty,
      rewards: {
        exp: updatedQuest.expReward,
        bronze: updatedQuest.bronzeReward,
        silver: updatedQuest.silverReward,
        gold: updatedQuest.goldReward
      },
      assignedTo: updatedQuest.character ? {
        id: updatedQuest.character.id,
        name: updatedQuest.character.name
      } : undefined,
      createdAt: updatedQuest.createdAt.toISOString()
    }

    return ApiResponseBuilder.success({ quest: questResponse }, `Quest ${action}ed successfully`)

  } catch (error) {
    console.error(`Error ${body?.action}ing quest:`, error)
    return ApiResponseBuilder.error(`Failed to ${body?.action} quest`, 500)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { questId } = params

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    })

    if (!quest) {
      return ApiResponseBuilder.notFound('Quest')
    }

    await prisma.quest.delete({
      where: { id: questId }
    })

    return ApiResponseBuilder.success(null, 'Quest deleted successfully')

  } catch (error) {
    console.error('Error deleting quest:', error)
    return ApiResponseBuilder.error('Failed to delete quest', 500)
  }
}
