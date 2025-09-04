import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get('guildId')
    const category = searchParams.get('category')

    if (!guildId) {
      return NextResponse.json(
        { error: 'Guild ID is required' },
        { status: 400 }
      )
    }

    const where: any = { guildId, isActive: true }
    if (category) {
      where.category = category.toUpperCase()
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    const transformedRewards = rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      icon: reward.icon,
      category: reward.category.toLowerCase(),
      rarity: reward.rarity.toLowerCase(),
      cost: {
        type: reward.goldCost > 0 ? 'gold' : reward.silverCost > 0 ? 'silver' : 'bronze',
        amount: reward.goldCost || reward.silverCost || reward.bronzeCost
      },
      availability: reward.stock ? 'limited' : 'always',
      stock: reward.stock
    }))

    return NextResponse.json({ rewards: transformedRewards })

  } catch (error) {
    console.error('Error fetching shop rewards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { characterId, rewardId, quantity = 1 } = body

    if (!characterId || !rewardId) {
      return NextResponse.json(
        { error: 'Character ID and Reward ID are required' },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get character and check active effects
      const character = await tx.character.findUnique({
        where: { id: characterId },
        include: { effects: true }
      })

      if (!character) {
        throw new Error('Character not found')
      }

      // Check if shop is blocked by effects
      const shopBlocked = character.effects.some(effect => {
        const restrictions = effect.restrictions as any
        return restrictions?.shopBlocked === true
      })

      if (shopBlocked) {
        throw new Error('Shop is blocked by character effects')
      }

      // Get reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId }
      })

      if (!reward) {
        throw new Error('Reward not found')
      }

      if (!reward.isActive) {
        throw new Error('Reward is not available')
      }

      // Check stock
      if (reward.stock !== null && reward.stock < quantity) {
        throw new Error('Insufficient stock')
      }

      // Calculate total cost
      const totalCost = {
        bronze: reward.bronzeCost * quantity,
        silver: reward.silverCost * quantity,
        gold: reward.goldCost * quantity
      }

      // Check if character has enough coins
      if (character.bronzeCoins < totalCost.bronze ||
          character.silverCoins < totalCost.silver ||
          character.goldCoins < totalCost.gold) {
        throw new Error('Insufficient funds')
      }

      // Deduct coins from character
      const updatedCharacter = await tx.character.update({
        where: { id: characterId },
        data: {
          bronzeCoins: character.bronzeCoins - totalCost.bronze,
          silverCoins: character.silverCoins - totalCost.silver,
          goldCoins: character.goldCoins - totalCost.gold
        }
      })

      // Update stock if limited
      if (reward.stock !== null) {
        await tx.reward.update({
          where: { id: rewardId },
          data: {
            stock: reward.stock - quantity
          }
        })
      }

      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          characterId,
          rewardId,
          quantity,
          totalCost,
          status: 'PENDING'
        }
      })

      // Add item to inventory
      await tx.inventoryItem.create({
        data: {
          characterId,
          name: reward.name,
          description: reward.description,
          icon: reward.icon,
          category: 'REWARD',
          rarity: reward.rarity,
          quantity
        }
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          guildId: character.guildId,
          characterId,
          type: 'PURCHASE_MADE',
          title: 'Покупка в магазине',
          description: `Куплено "${reward.name}"`,
          icon: '🛒',
          metadata: { purchaseId: purchase.id, rewardId, quantity, cost: totalCost }
        }
      })

      return { purchase, character: updatedCharacter }
    })

    return NextResponse.json({ 
      success: true, 
      purchase: result.purchase,
      character: result.character 
    })

  } catch (error) {
    console.error('Error making purchase:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
