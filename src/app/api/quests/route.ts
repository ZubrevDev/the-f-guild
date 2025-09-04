import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

interface QuestResponse {
  id: string
  title: string
  description: string
  type: string
  status: string
  difficulty: number
  rewards: {
    exp: number
    bronze: number
    silver: number
    gold: number
  }
  assignedTo?: {
    id: string
    name: string
  }
  createdAt: string
}

export async function GET(request: NextRequest) {
  console.log('API: GET /api/quests called')
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get('guildId')
    const status = searchParams.get('status')
    
    console.log('API: guildId:', guildId, 'status:', status)
    
    if (!guildId) {
      console.log('API: No guildId provided')
      return ApiResponseBuilder.error('Guild ID is required', 400)
    }

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      guildId: guildId
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    console.log('API: Where clause:', whereClause)

    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        character: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Show AVAILABLE first
        { createdAt: 'desc' }
      ]
    })

    console.log('API: Found quests:', quests.length)
    console.log('API: Where clause:', whereClause)
    console.log('API: First quest:', quests[0] || 'none')

    const questsResponse: QuestResponse[] = quests.map(quest => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      type: quest.type.toLowerCase(),
      status: quest.status.toLowerCase(),
      difficulty: quest.difficulty,
      rewards: {
        exp: quest.expReward,
        bronze: quest.bronzeReward,
        silver: quest.silverReward,
        gold: quest.goldReward
      },
      assignedTo: quest.character ? {
        id: quest.character.id,
        name: quest.character.name
      } : undefined,
      createdAt: quest.createdAt.toISOString()
    }))

    console.log('API: Mapped quests response:', questsResponse)
    const result = ApiResponseBuilder.success({ quests: questsResponse })
    console.log('API: Final result:', result)
    return result
  } catch (error) {
    console.error('API: Error in GET /api/quests:', error)
    return ApiResponseBuilder.error('Failed to fetch quests', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guildId, title, description, type, difficulty, rewards } = body

    if (!guildId || !title || !description || !type || !rewards) {
      return ApiResponseBuilder.validationError('Missing required fields')
    }

    const quest = await prisma.quest.create({
      data: {
        guildId,
        title,
        description,
        type: type.toUpperCase(),
        difficulty: difficulty || 1,
        expReward: rewards.exp || 0,
        bronzeReward: rewards.bronze || 0,
        silverReward: rewards.silver || 0,
        goldReward: rewards.gold || 0,
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

    const questResponse: QuestResponse = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      type: quest.type.toLowerCase(),
      status: quest.status.toLowerCase(),
      difficulty: quest.difficulty,
      rewards: {
        exp: quest.expReward,
        bronze: quest.bronzeReward,
        silver: quest.silverReward,
        gold: quest.goldReward
      },
      assignedTo: quest.character ? {
        id: quest.character.id,
        name: quest.character.name
      } : undefined,
      createdAt: quest.createdAt.toISOString()
    }

    return ApiResponseBuilder.success({ quest: questResponse }, 'Quest created successfully')
  } catch (error) {
    console.error('Error creating quest:', error)
    return ApiResponseBuilder.error('Failed to create quest', 500)
  }
}
