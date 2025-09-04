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

    if (!questId) {
      return ApiResponseBuilder.validationError('Quest ID is required')
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    })

    if (!quest) {
      return ApiResponseBuilder.notFound('Quest')
    }

    // Check if this is an action-based update (accept/complete/approve) or a full quest update
    if (body.action) {
      const { action, characterId } = body
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
              title: 'Квест выполнен',
              description: `Выполнил квест "${quest.title}"`,
              icon: '✅',
              metadata: { questId: questId }
            }
          })

          break

        case 'approve':
          updatedQuest = await prisma.quest.update({
            where: { id: questId },
            data: {
              status: 'APPROVED'
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
                experience: {
                  increment: quest.expReward
                },
                bronzeCoins: {
                  increment: quest.bronzeReward
                },
                silverCoins: {
                  increment: quest.silverReward
                },
                goldCoins: {
                  increment: quest.goldReward
                }
              }
            })

            // Log activity
            await prisma.activityLog.create({
              data: {
                guildId: quest.guildId,
                characterId: quest.characterId,
                type: 'QUEST_COMPLETED',
                title: 'Квест одобрен',
                description: `Квест "${quest.title}" одобрен и награды получены`,
                icon: '🏆',
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
          }

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
    } else {
      // This is a full quest update
      const { title, description, type, difficulty, status, characterId, rewards } = body

      const updateData: Record<string, unknown> = {}
      
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (type !== undefined) updateData.type = type.toUpperCase()
      if (difficulty !== undefined) updateData.difficulty = difficulty
      if (status !== undefined) updateData.status = status.toUpperCase()
      if (characterId !== undefined) updateData.characterId = characterId === null ? null : characterId
      if (rewards) {
        if (rewards.exp !== undefined) updateData.expReward = rewards.exp
        if (rewards.bronze !== undefined) updateData.bronzeReward = rewards.bronze
        if (rewards.silver !== undefined) updateData.silverReward = rewards.silver
        if (rewards.gold !== undefined) updateData.goldReward = rewards.gold
      }

      const updatedQuest = await prisma.quest.update({
        where: { id: questId },
        data: updateData,
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

      return ApiResponseBuilder.success({ quest: questResponse }, 'Quest updated successfully')
    }

  } catch (error) {
    console.error('Error updating quest:', error)
    return ApiResponseBuilder.error('Failed to update quest', 500)
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
