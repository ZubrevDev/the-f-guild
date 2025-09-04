import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    const { type, amount } = await request.json()
    
    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Неверные параметры награды' },
        { status: 400 }
      )
    }

    // Здесь должна быть логика добавления монет в базу данных
    // const updatedPlayer = await prisma.user.update({
    //   where: { id: playerId },
    //   data: {
    //     coins: {
    //       increment: {
    //         [type]: amount
    //       }
    //     }
    //   }
    // })

    // Временная заглушка
    console.log(`Игроку ${playerId} выдано ${amount} ${type}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Выдано ${amount} ${type}`,
      reward: { type, amount }
    })
    
  } catch (error) {
    console.error('Ошибка при выдаче награды:', error)
    return NextResponse.json(
      { error: 'Не удалось выдать награду' },
      { status: 500 }
    )
  }
}
