import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    
    // Здесь должна быть логика блокировки игрока в базе данных
    // const blocked = await prisma.user.update({
    //   where: { id: playerId },
    //   data: { status: 'BLOCKED' }
    // })

    // Временная заглушка
    console.log(`Игрок ${playerId} заблокирован`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Игрок успешно заблокирован' 
    })
    
  } catch (error) {
    console.error('Ошибка при блокировке игрока:', error)
    return NextResponse.json(
      { error: 'Не удалось заблокировать игрока' },
      { status: 500 }
    )
  }
}
