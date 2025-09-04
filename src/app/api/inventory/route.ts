import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')
    const category = searchParams.get('category')

    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      )
    }

    const where: any = { characterId }
    if (category) {
      where.category = category.toUpperCase()
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: [
        { used: 'asc' },
        { obtainedAt: 'desc' }
      ]
    })

    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      category: item.category.toLowerCase(),
      rarity: item.rarity.toLowerCase(),
      quantity: item.quantity,
      usable: item.usable,
      used: item.used,
      obtainedAt: item.obtainedAt,
      expiresAt: item.expiresAt
    }))

    // Get available titles
    const titles = items.filter(item => item.category === 'TITLE').map(item => item.name)

    // Get active title from character
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { activeTitle: true }
    })

    return NextResponse.json({ 
      items: transformedItems,
      playerTitles: titles,
      activeTitle: character?.activeTitle || null
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, action, characterId, title } = body

    if (action === 'use_item') {
      if (!itemId || !characterId) {
        return NextResponse.json(
          { error: 'Item ID and Character ID are required' },
          { status: 400 }
        )
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get item
        const item = await tx.inventoryItem.findUnique({
          where: { id: itemId }
        })

        if (!item) {
          throw new Error('Item not found')
        }

        if (!item.usable || item.used) {
          throw new Error('Item cannot be used')
        }

        // Check if expired
        if (item.expiresAt && new Date() > item.expiresAt) {
          throw new Error('Item has expired')
        }

        // Use item
        let updatedItem
        if (item.quantity > 1) {
          updatedItem = await tx.inventoryItem.update({
            where: { id: itemId },
            data: { quantity: item.quantity - 1 }
          })
        } else {
          updatedItem = await tx.inventoryItem.update({
            where: { id: itemId },
            data: { used: true }
          })
        }

        // Apply item effects if consumable
        if (item.category === 'CONSUMABLE') {
          // Create temporary effect based on item
          const effectData = getEffectDataFromItem(item)
          if (effectData) {
            await tx.effect.create({
              data: {
                characterId,
                ...effectData,
                reason: `Использовал предмет "${item.name}"`
              }
            })
          }
        }

        // Log activity
        const character = await tx.character.findUnique({
          where: { id: characterId },
          select: { guildId: true }
        })

        if (character) {
          await tx.activityLog.create({
            data: {
              guildId: character.guildId,
              characterId,
              type: 'PURCHASE_MADE', // We'll need to add item usage type
              title: 'Предмет использован',
              description: `Использовал "${item.name}"`,
              icon: '🎁',
              metadata: { itemId, itemName: item.name, category: item.category }
            }
          })
        }

        return updatedItem
      })

      return NextResponse.json({ success: true, item: result })

    } else if (action === 'equip_title') {
      if (!characterId || !title) {
        return NextResponse.json(
          { error: 'Character ID and title are required' },
          { status: 400 }
        )
      }

      // Check if character has this title
      const titleItem = await prisma.inventoryItem.findFirst({
        where: {
          characterId,
          name: title,
          category: 'TITLE'
        }
      })

      if (!titleItem) {
        return NextResponse.json(
          { error: 'Title not found in inventory' },
          { status: 404 }
        )
      }

      // Update character's active title
      const updatedCharacter = await prisma.character.update({
        where: { id: characterId },
        data: { activeTitle: title }
      })

      return NextResponse.json({ success: true, character: updatedCharacter })

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function getEffectDataFromItem(item: any) {
  // Map item names to effect data
  const effectMap: Record<string, any> = {
    'Заряд энергии': {
      name: 'Заряд энергии',
      type: 'BUFF',
      description: '+50% опыта на следующий день',
      icon: '⚡',
      duration: 1,
      maxDuration: 1,
      multipliers: { xpMultiplier: 1.5 }
    },
    'Пропуск задания': {
      name: 'Пропуск задания',
      type: 'BUFF',
      description: 'Можно пропустить одно задание без штрафа',
      icon: '🏃‍♂️',
      duration: 7,
      maxDuration: 7,
      bonuses: { questSkip: 1 }
    }
  }

  return effectMap[item.name] || null
}
