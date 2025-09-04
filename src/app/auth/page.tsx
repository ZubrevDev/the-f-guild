'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Shield,
  Sparkles,
  Sword,
  Heart,
  Star
} from 'lucide-react'
import Link from 'next/link'

type UserRole = 'guildmaster' | 'player'

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleGoogleAuth = async (role: UserRole) => {
    setIsLoading(true)
    try {
      const result = await signIn('google', {
        callbackUrl: role === 'guildmaster' ? '/dm' : '/player',
        redirect: false
      })
      
      if (result?.error) {
        toast.error('Ошибка входа через Google')
      } else {
        toast.success('Успешный вход!')
        router.push(role === 'guildmaster' ? '/dm' : '/player')
      }
    } catch (error) {
      toast.error('Ошибка аутентификации')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGuild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const guildName = formData.get('guild-name') as string
    const guildDescription = formData.get('guild-description') as string
    
    try {
      // Создаем гильдмастера и гильдию одновременно
      const response = await fetch('/api/create-guildmaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          guildName,
          guildDescription
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Гильдия "${guildName}" создана! Код: ${data.guild.code}`)
        
        // Теперь входим в систему
        const result = await signIn('credentials', {
          email,
          password,
          action: 'login',
          redirect: false
        })

        if (result?.error) {
          console.error('Login error:', result.error)
          toast.error('Ошибка входа после регистрации')
        } else if (result?.ok) {
          // Успешный вход, переходим в дашборд
          toast.success('Добро пожаловать в систему!')
          router.push('/dm')
        } else {
          toast.error('Неизвестная ошибка при входе')
        }
      } else {
        toast.error(data.error || 'Ошибка создания гильдии')
      }
    } catch (error) {
      console.error('Error creating guild:', error)
      toast.error('Ошибка создания гильдии')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        action: 'login',
        redirect: false
      })
      
      if (result?.error) {
        toast.error('Неверный email или пароль')
      } else {
        toast.success('Добро пожаловать!')
        // Перенаправляем в зависимости от роли
        // Это будет определено в useUserSession после получения данных пользователя
        router.push('/dm') // временно, потом сделаем умное перенаправление
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGuild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const guildCode = formData.get('guild-code') as string

    if (!name || !email || !password || !guildCode) {
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    try {
      setIsLoading(true)

      // Создаем игрока и присоединяем к гильдии одновременно
      const response = await fetch('/api/join-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          guildCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Добро пожаловать в гильдию "${data.guild.name}"!`)
        
        // Теперь входим в систему
        const result = await signIn('credentials', {
          email,
          password,
          action: 'login',
          redirect: false
        })

        if (result?.error) {
          console.error('Login error:', result.error)
          toast.error('Ошибка входа после регистрации')
        } else if (result?.ok) {
          // Успешный вход, переходим в дашборд
          toast.success('Добро пожаловать в систему!')
          router.push('/player')
        } else {
          toast.error('Неизвестная ошибка при входе')
        }
      } else {
        toast.error(data.error || 'Ошибка присоединения к гильдии')
      }
      
    } catch (error) {
      console.error('Join guild error:', error)
      toast.error('Ошибка при присоединении к гильдии')
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Вернуться на главную
              </Link>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Начать приключение
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Выберите свою роль в семейной гильдии приключений
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Guildmaster */}
              <Card 
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 cursor-pointer transform hover:scale-105 group"
                onClick={() => setSelectedRole('guildmaster')}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-300">
                    👑
                  </div>
                  <CardTitle className="text-3xl text-white mb-2 flex items-center justify-center gap-2">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    Гилд-мастер
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Я родитель и хочу управлять семейной гильдией
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span>Создание квестов для детей</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span>Применение магических эффектов</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>Управление наградами</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Создает новую гильдию
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Player */}
              <Card 
                className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 cursor-pointer transform hover:scale-105 group"
                onClick={() => setSelectedRole('player')}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-300">
                    ⚔️
                  </div>
                  <CardTitle className="text-3xl text-white mb-2 flex items-center justify-center gap-2">
                    <Sword className="w-8 h-8 text-blue-400" />
                    Искатель Приключений
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Я ребенок и хочу выполнять квесты
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Star className="w-5 h-5 text-blue-400" />
                      <span>Выполнение квестов</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Heart className="w-5 h-5 text-blue-400" />
                      <span>Развитие персонажа</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span>Покупка наград</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Присоединяется к гильдии
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-400">
                Не знаете, что выбрать? 
                <Link href="/help" className="text-blue-400 hover:text-blue-300 ml-2">
                  Посмотрите руководство
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => setSelectedRole(null)}
              className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Изменить роль
            </button>
            
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${
              selectedRole === 'guildmaster' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            } flex items-center justify-center text-3xl`}>
              {selectedRole === 'guildmaster' ? '👑' : '⚔️'}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedRole === 'guildmaster' ? 'Создать гильдию' : 'Присоединиться к гильдии'}
            </h1>
            <p className="text-slate-300">
              {selectedRole === 'guildmaster' 
                ? 'Настройте свою семейную гильдию' 
                : 'Введите код гильдии или создайте персонажа'
              }
            </p>
          </div>

          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardContent className="p-6">
              {selectedRole === 'guildmaster' ? (
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Создать новую</TabsTrigger>
                    <TabsTrigger value="login">Войти в существующую</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-4">
                    <form onSubmit={handleCreateGuild} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Ваше имя</Label>
                        <Input 
                          id="name"
                          name="name"
                          placeholder="Иван Иванов"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="guild-name" className="text-white">Название гильдии</Label>
                        <Input 
                        id="guild-name"
                        name="guild-name"
                        placeholder="Семья Драконоборцев"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="guild-description" className="text-white">Описание (необязательно)</Label>
                        <Input 
                          id="guild-description"
                          name="guild-description"
                          placeholder="Наша семейная команда героев"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ваш@email.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Пароль</Label>
                        <div className="relative">
                          <Input 
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ваш пароль"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                          required
                        />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Создание...' : 'Создать гильдию'}
                      </Button>
                    </form>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-white/50">или</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleGoogleAuth('guildmaster')}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Продолжить с Google
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-white">Email</Label>
                        <Input 
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="ваш@email.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-white">Пароль</Label>
                        <div className="relative">
                          <Input 
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ваш пароль"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Вход...' : 'Войти в гильдию'}
                      </Button>
                    </form>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-white/50">или</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleGoogleAuth('guildmaster')}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Продолжить с Google
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs defaultValue="join" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="join">Присоединиться</TabsTrigger>
                    <TabsTrigger value="create-character">Создать персонажа</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="join" className="space-y-4">
                    <form onSubmit={handleJoinGuild} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="player-name" className="text-white">Ваше имя</Label>
                        <Input 
                          id="player-name"
                          name="name"
                          placeholder="Анна Петрова"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player-email" className="text-white">Email</Label>
                        <Input 
                          id="player-email"
                          name="email"
                          type="email"
                          placeholder="ваш@email.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player-password" className="text-white">Пароль</Label>
                        <div className="relative">
                          <Input 
                            id="player-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ваш пароль"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guild-code" className="text-white">Код гильдии</Label>
                        <Input 
                          id="guild-code"
                          name="guild-code"
                          placeholder="Введите код"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg font-mono tracking-wider"
                          required
                        />
                        <p className="text-xs text-white/50">
                          Получите код от вашего гильдмастера
                        </p>
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Присоединение...' : 'Присоединиться к гильдии'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="create-character" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="character-name" className="text-white">Имя персонажа</Label>
                        <Input 
                          id="character-name"
                          placeholder="Как тебя зовут?"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Выбери класс персонажа</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Card className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">⚔️</div>
                              <div className="text-white text-sm">Воин</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🏹</div>
                              <div className="text-white text-sm">Лучник</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🔮</div>
                              <div className="text-white text-sm">Маг</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🛡️</div>
                              <div className="text-white text-sm">Паладин</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="guild-code-character" className="text-white">Код гильдии</Label>
                        <Input 
                          id="guild-code-character"
                          placeholder="Код от родителей"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center font-mono"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Создание персонажа...' : 'Создать персонажа'}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Продолжая, вы соглашаетесь с{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                условиями использования
              </Link>
              {' '}и{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                политикой конфиденциальности
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}