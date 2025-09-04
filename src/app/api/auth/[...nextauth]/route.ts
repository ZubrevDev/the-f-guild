import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  guildId?: string;
}

interface ExtendedSession {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    guildId?: string;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'text' }, // 'login' or 'register'
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { email, password, action, name, role } = credentials

          if (action === 'register') {
            // Регистрация нового пользователя
            const existingUser = await prisma.user.findUnique({
              where: { email }
            })

            if (existingUser) {
              throw new Error('Пользователь с таким email уже существует')
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            
            const user = await prisma.user.create({
              data: {
                email,
                name: name || 'Новый пользователь',
                password: hashedPassword,
                role: (role as 'GUILDMASTER' | 'PLAYER') || 'PLAYER',
              }
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              guildId: user.guildId
            }
          } else {
            // Вход существующего пользователя
            const user = await prisma.user.findUnique({
              where: { email }
            })

            if (!user || !user.password) {
              throw new Error('Пользователь не найден')
            }

            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!isValidPassword) {
              throw new Error('Неверный пароль')
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              guildId: user.guildId
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          // Возвращаем конкретную ошибку
          throw new Error(error instanceof Error ? error.message : 'Ошибка аутентификации')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.guildId = extendedUser.guildId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const extendedUser = session.user as ExtendedSession['user'];
        extendedUser.role = token.role as string;
        extendedUser.guildId = token.guildId as string;
      }
      return session;
    },
    async signIn() {
      // Разрешаем все успешные аутентификации
      return true;
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }