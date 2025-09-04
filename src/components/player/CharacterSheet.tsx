'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CharacterSheetProps {
  character: {
    id: string
    name: string
    class: string
    level: number
    experience: number
    maxExperience: number
    avatar: string
    coins: { gold: number; silver: number; bronze: number }
    stats: {
      completedQuests: number
      totalGold: number
      currentStreak: number
      achievements: number
    }
  }
  activeEffects: Array<{
    id: string
    name: string
    type: string
    icon: string
    description: string
    duration: number
    maxDuration: number
    effects: any
  }>
}

export default function CharacterSheet({ character, activeEffects }: CharacterSheetProps) {
  const progressPercent = (character.experience / character.maxExperience) * 100

  const getEffectColor = (type: string) => {
    switch (type) {
      case 'blessing': return 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
      case 'curse': return 'border-red-500 bg-red-500/10 text-red-300'
      case 'debuff': return 'border-red-400 bg-red-400/10 text-red-300'
      case 'buff': return 'border-green-400 bg-green-400/10 text-green-300'
      case 'disease': return 'border-purple-400 bg-purple-400/10 text-purple-300'
      default: return 'border-blue-400 bg-blue-400/10 text-blue-300'
    }
  }

  const getOverallStatus = () => {
    const positiveEffects = activeEffects.filter(e => e.type === 'blessing' || e.type === 'buff').length
    const negativeEffects = activeEffects.filter(e => e.type === 'curse' || e.type === 'debuff' || e.type === 'disease').length
    
    if (positiveEffects > negativeEffects) {
      return { text: 'Отличное', color: 'text-green-400', icon: '🌟' }
    } else if (negativeEffects > positiveEffects) {
      return { text: 'Требует внимания', color: 'text-red-400', icon: '⚠️' }
    } else {
      return { text: 'Нейтральное', color: 'text-yellow-400', icon: '⚖️' }
    }
  }

  const status = getOverallStatus()

  return (
    <div className="space-y-6">
      {/* Main Character Card */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-5xl border-4 border-yellow-400 shadow-lg">
              {character.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{character.name}</h1>
              <p className="text-xl text-slate-300 mb-4">{character.class} • Уровень {character.level}</p>
              
              {/* Experience Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Прогресс до следующего уровня</span>
                  <span className="text-white font-bold">{character.experience}/{character.maxExperience}</span>
                </div>
                <Progress value={progressPercent} className="h-4" />
                <div className="text-xs text-slate-400 text-right">
                  {character.maxExperience - character.experience} опыта до повышения
                </div>
              </div>
            </div>
            
            {/* Currency Display */}
            <div className="flex gap-4">
              <div className="text-center bg-yellow-500/20 px-4 py-3 rounded-lg border border-yellow-500/30">
                <div className="text-3xl mb-1">🥇</div>
                <div className="font-bold text-yellow-300 text-lg">{character.coins.gold}</div>
                <div className="text-xs text-slate-400">Золото</div>
              </div>
              <div className="text-center bg-gray-500/20 px-4 py-3 rounded-lg border border-gray-500/30">
                <div className="text-3xl mb-1">🥈</div>
                <div className="font-bold text-gray-300 text-lg">{character.coins.silver}</div>
                <div className="text-xs text-slate-400">Серебро</div>
              </div>
              <div className="text-center bg-orange-500/20 px-4 py-3 rounded-lg border border-orange-500/30">
                <div className="text-3xl mb-1">🥉</div>
                <div className="font-bold text-orange-300 text-lg">{character.coins.bronze}</div>
                <div className="text-xs text-slate-400">Бронза</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">{character.stats.completedQuests}</div>
            <div className="text-sm text-slate-400">Квестов выполнено</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{character.stats.totalGold}</div>
            <div className="text-sm text-slate-400">Всего золота</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{character.stats.currentStreak}</div>
            <div className="text-sm text-slate-400">Дней подряд</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">{character.stats.achievements}</div>
            <div className="text-sm text-slate-400">Достижений</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Effects */}
      {activeEffects.length > 0 && (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">🎭 Активные эффекты</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Общее состояние:</span>
                <Badge className={`${status.color} bg-transparent border`}>
                  {status.icon} {status.text}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEffects.map((effect) => (
                <div 
                  key={effect.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getEffectColor(effect.type)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{effect.icon}</span>
                      <span className="font-bold text-white text-sm">{effect.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {effect.duration}д
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{effect.description}</p>
                  <div className="space-y-1">
                    <Progress 
                      value={(effect.duration / effect.maxDuration) * 100} 
                      className="h-2" 
                    />
                    <div className="text-xs text-slate-400 text-center">
                      {effect.duration} из {effect.maxDuration} дней
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {activeEffects.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😊</div>
                <p className="text-slate-400 mb-4">Нет активных эффектов</p>
                <p className="text-sm text-slate-500">Выполняйте квесты, чтобы получить благословения!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
