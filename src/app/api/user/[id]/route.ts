import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder } from '@/lib/api-response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const userId = id
    const body = await request.json()

    console.log('User PATCH API called')
    console.log('User ID:', userId)
    console.log('Request body:', body)

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    console.log('Existing user:', existingUser)

    if (!existingUser) {
      console.error('User not found:', userId)
      return ApiResponseBuilder.error('User not found', 404)
    }

    // Подготавливаем данные для обновления
    const updateData: {
      name?: string;
      email?: string;
    } = {}
    
    if (body.name) {
      updateData.name = body.name
    }
    
    if (body.email && body.email.trim() !== '') {
      // Проверяем, что email уникален (только если это не текущий пользователь)
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: body.email }
      })
      
      console.log('Existing user with email:', existingUserWithEmail)
      
      // Если email занят другим пользователем (не текущим), то ошибка
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        console.error('Email already exists for different user:', body.email)
        return ApiResponseBuilder.error(`Email "${body.email}" уже используется другим пользователем. Выберите другой email.`, 400)
      }
      
      // Если это тот же email что и у текущего пользователя, или свободный email - можно обновлять
      updateData.email = body.email
    }

    console.log('Update data:', updateData)

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log('Updated user:', updatedUser)

    return ApiResponseBuilder.success({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    })

  } catch (error) {
    console.error('User PATCH API error:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
