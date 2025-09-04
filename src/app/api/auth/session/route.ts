import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { ApiResponseBuilder } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return ApiResponseBuilder.error('Not authenticated', 401)
    }

    // Получаем пользователя из базы данных
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        guildId: true,
      }
    })

    if (!user) {
      return ApiResponseBuilder.error('User not found', 404)
    }

    return ApiResponseBuilder.success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        guildId: user.guildId,
      }
    })

  } catch (error) {
    console.error('Session API error:', error)
    return ApiResponseBuilder.error('Internal server error', 500)
  }
}
