import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Получить или создать гильдию
    let guild = await prisma.guild.findFirst()
    
    if (!guild) {
      guild = await prisma.guild.create({
        data: {
          name: "The F Guild",
          description: "Family D&D Quest System",
          memberCount: 2,
          activeQuests: 5,
          completedToday: 3,
        }
      })
    }

    return NextResponse.json({
      guild: guild,
      onlineMembers: 1, // Пока статично, потом сделаем динамично
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching guild stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    )
  }
}