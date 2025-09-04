import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder, handleApiError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const guildId = url.searchParams.get('guildId')
    
    if (!guildId) {
      return ApiResponseBuilder.validationError('Guild ID is required')
    }

    const rewards = await prisma.reward.findMany({
      where: { guildId, isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    const formattedRewards = rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      category: reward.category.toLowerCase(),
      icon: reward.icon,
      price: {
        bronze: reward.bronzeCost || 0,
        silver: reward.silverCost || 0,
        gold: reward.goldCost || 0
      },
      availability: reward.stock ? 'limited' : 'unlimited',
      stock: reward.stock,
      isActive: reward.isActive,
      createdAt: reward.createdAt.toISOString().split('T')[0],
      updatedAt: reward.updatedAt.toISOString().split('T')[0]
    }))

    return ApiResponseBuilder.success({ rewards: formattedRewards }, 'Rewards retrieved successfully')

  } catch (error) {
    return handleApiError(error)
  }
}export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guildId, name, description, category, icon, price, availability, stock } = body

    // Валидация обязательных полей
    if (!guildId || !name || !category) {
      return NextResponse.json(
        { error: 'Guild ID, name, and category are required' }, 
        { status: 400 }
      )
    }

    // Маппирование категорий к допустимым значениям RewardCategory
    const categoryMapping: { [key: string]: string } = {
      'ITEM': 'SPECIAL',
      'ENTERTAINMENT': 'ENTERTAINMENT',
      'MONEY': 'MONEY',
      'ACTIVITIES': 'ACTIVITIES', 
      'CREATIVE': 'CREATIVE',
      'SPECIAL': 'SPECIAL'
    }

    const validCategory = categoryMapping[category.toUpperCase()] || 'SPECIAL'

    const reward = await prisma.reward.create({
      data: {
        guildId,
        name,
        description,
        category: validCategory as 'ENTERTAINMENT' | 'MONEY' | 'ACTIVITIES' | 'CREATIVE' | 'SPECIAL',
        icon,
        bronzeCost: price?.bronze || 0,
        silverCost: price?.silver || 0,
        goldCost: price?.gold || 0,
        stock: availability === 'limited' ? stock : null,
        isActive: true
      }
    })

    const formattedReward = {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      category: reward.category.toLowerCase(),
      icon: reward.icon,
      price: {
        bronze: reward.bronzeCost,
        silver: reward.silverCost,
        gold: reward.goldCost
      },
      availability: reward.stock ? 'limited' : 'unlimited',
      stock: reward.stock,
      isActive: reward.isActive,
      createdAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({ reward: formattedReward })

  } catch (error) {
    console.error('Error creating reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
