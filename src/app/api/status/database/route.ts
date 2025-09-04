import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    // Try to connect to database and get counts
    const [users, guilds, characters, quests, effects] = await Promise.all([
      prisma.user.count(),
      prisma.guild.count(), 
      prisma.character.count(),
      prisma.quest.count(),
      prisma.effect.count()
    ])

    const status = {
      connected: true,
      users,
      guilds,
      characters,
      quests,
      effects,
      timestamp: new Date().toISOString()
    }

    return ApiResponseBuilder.success(status, 'Database is healthy')

  } catch (error) {
    console.error('Database health check failed:', error)
    
    return ApiResponseBuilder.error(
      `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      503
    )
  }
}
