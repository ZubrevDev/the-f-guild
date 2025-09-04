'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Trophy, 
  Star, 
  Coins, 
  Shield, 
  Sword,
  ArrowRight,
  Sparkles,
  Target,
  Gift,
  Heart,
  Crown,
  Gamepad2
} from 'lucide-react'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Система квестов",
      description: "Превратите обычные домашние дела в захватывающие приключения",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Прогресс и уровни",
      description: "Отслеживайте достижения и развивайте своего персонажа",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Валютная система",
      description: "Зарабатывайте бронзу, серебро и золото за выполненные задания",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Магазин наград",
      description: "Обменивайте заработанные монеты на желанные призы",
      color: "from-purple-500 to-pink-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🏰</div>
              <span className="text-2xl font-bold text-white">The F Guild</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                О проекте
              </Button>
              <Link href="/auth">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Войти
              </Button>
            </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
              ✨ Семейная система мотивации
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Превратите дела в
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {" "}эпические квесты
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Геймифицированная система для семьи, где домашние дела становятся увлекательными приключениями, 
            а дети развивают ответственность через игру
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Создать семейную гильдию
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-full"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Попробовать демо
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">500+</div>
              <div className="text-slate-400">Семей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">15K+</div>
              <div className="text-slate-400">Квестов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">98%</div>
              <div className="text-slate-400">Довольных</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">24/7</div>
              <div className="text-slate-400">Поддержка</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Как это работает?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Простая и увлекательная система, которая мотивирует детей быть ответственными
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all duration-500 cursor-pointer transform hover:scale-105"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white transform transition-transform duration-300 ${hoveredFeature === index ? 'scale-110 rotate-12' : ''}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Role Selection */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Выберите свою роль
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Каждая роль имеет свои уникальные возможности и интерфейс
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Guildmaster Card */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-300">
                  🎲
                </div>
                <CardTitle className="text-3xl text-white mb-2 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  Гилд-мастер
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  Управляйте семейной гильдией как настоящий лидер
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Создание и настройка квестов</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Применение магических эффектов</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Управление участниками</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Star className="w-5 h-5 text-purple-400" />
                    <span>Настройка системы наград</span>
                  </div>
                </div>
                
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                  >
                    Стать Гилд-мастером
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Player Card */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-300">
                  ⚔️
                </div>
                <CardTitle className="text-3xl text-white mb-2 flex items-center justify-center gap-2">
                  <Sword className="w-8 h-8 text-blue-400" />
                  Искатель Приключений
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  Выполняйте квесты и развивайте своего персонажа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Выполнение эпических квестов</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Trophy className="w-5 h-5 text-blue-400" />
                    <span>Прокачка уровня персонажа</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Coins className="w-5 h-5 text-blue-400" />
                    <span>Сбор сокровищ и монет</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Gift className="w-5 h-5 text-blue-400" />
                    <span>Покупки в магазине наград</span>
                  </div>
                </div>
                
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                  >
                    Начать приключение
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/guild-hall">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/5 border-white/30 text-white hover:bg-white/10 backdrop-blur"
              >
                <Heart className="w-5 h-5 mr-2" />
                🏰 Посетить Зал Гильдии
              </Button>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Готовы начать семейное приключение?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к тысячам семей, которые уже превратили повседневные дела в увлекательную игру
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-4"
                  >
                    Создать бесплатно
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  Узнать больше
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="text-2xl">🏰</div>
              <span className="text-xl font-bold text-white">The F Guild</span>
            </div>
            <p className="text-slate-400 mb-4">
              Семейная система квестов в стиле D&D
            </p>
            <div className="flex justify-center space-x-6 text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Конфиденциальность
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Условия использования
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                Поддержка
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}