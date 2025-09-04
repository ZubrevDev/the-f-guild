import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function PATCH(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { guild: true }
    })

    if (!user?.guild) {
      return NextResponse.json({ error: 'User not in guild' }, { status: 404 })
    }

    const { action } = await request.json()
    const questId = params.id

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { character: true }
    })

    if (!quest || quest.guildId !== user.guild.id) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (action === 'approve' && user.role === 'GUILDMASTER') {
      // Award rewards to character
      if (quest.character) {
        await prisma.character.update({
          where: { id: quest.character.id },
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

        // Check for level up
        const updatedCharacter = await prisma.character.findUnique({
          where: { id: quest.character.id }
        })

        if (updatedCharacter) {
          const expNeeded = updatedCharacter.level * 200 // Simple level formula
          if (updatedCharacter.experience >= expNeeded) {
            await prisma.character.update({
              where: { id: quest.character.id },
              data: {
                level: {
                  increment: 1
                },
                experience: updatedCharacter.experience - expNeeded
              }
            })
          }
        }
      }

      // Update quest status
      const updatedQuest = await prisma.quest.update({
        where: { id: questId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        }
      })

      return NextResponse.json({ 
        quest: updatedQuest,
        message: 'Quest approved and rewards granted'
      })

    } else if (action === 'reject' && user.role === 'GUILDMASTER') {
      const updatedQuest = await prisma.quest.update({
        where: { id: questId },
        data: {
          status: 'IN_PROGRESS'
        }
      })

      return NextResponse.json({ 
        quest: updatedQuest,
        message: 'Quest returned for completion'
      })

    } else if (action === 'complete' && quest.characterId === user.characters?.[0]?.id) {
      const updatedQuest = await prisma.quest.update({
        where: { id: questId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      return NextResponse.json({ 
        quest: updatedQuest,
        message: 'Quest marked as completed, awaiting approval'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action or insufficient permissions' }, { status: 403 })
    }

  } catch (error) {
    console.error('Error updating quest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { guild: true }
    })

    if (!user?.guild || user.role !== 'GUILDMASTER') {
      return NextResponse.json({ error: 'Only guildmasters can delete quests' }, { status: 403 })
    }

    const questId = params.id

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    })

    if (!quest || quest.guildId !== user.guild.id) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    await prisma.quest.delete({
      where: { id: questId }
    })

    return NextResponse.json({ message: 'Quest deleted successfully' })

  } catch (error) {
    console.error('Error deleting quest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}