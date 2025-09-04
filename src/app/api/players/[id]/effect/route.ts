import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    const { type, duration } = await request.json()
    
    if (!type || !duration || duration <= 0) {
      return NextResponse.json(
        { error: 'Неверные параметры эффекта' },
        { status: 400 }
      )
    }

    // Здесь должна быть логика добавления эффекта в базу данных
    // const newEffect = await prisma.effect.create({
    //   data: {
    //     userId: playerId,
    //     name: type,
    //     type: determineEffectType(type),
    //     duration: duration,
    //     expiresAt: new Date(Date.now() + duration * 60 * 1000)
    //   }
    // })

    // Временная заглушка
    console.log(`Игроку ${playerId} применен эффект ${type} на ${duration} минут`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Эффект "${type}" применен на ${duration} минут`,
      effect: { 
        id: Date.now().toString(),
        name: type, 
        type: determineEffectType(type),
        duration 
      }
    })
    
  } catch (error) {
    console.error('Ошибка при применении эффекта:', error)
    return NextResponse.json(
      { error: 'Не удалось применить эффект' },
      { status: 500 }
    )
  }
}

function determineEffectType(effectName: string): 'blessing' | 'curse' | 'buff' | 'debuff' {
  const blessings = ['Благословение удачи', 'Энергия', 'Мудрость']
  const curses = ['Усталость', 'Невезение', 'Забывчивость']
  
  if (blessings.some(blessing => effectName.includes(blessing))) {
    return 'blessing'
  } else if (curses.some(curse => effectName.includes(curse))) {
    return 'curse'
  } else if (effectName.includes('Баф') || effectName.includes('Усиление')) {
    return 'buff'
  } else {
    return 'debuff'
  }
}
