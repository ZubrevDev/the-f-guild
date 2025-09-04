'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  reward?: {
    exp: number
    coins?: { gold?: number; silver?: number; bronze?: number }
    title?: string
  }
}

interface AchievementsProps {
  achievements: Achievement[]
  playerStats: {
    completedQuests: number
    totalGold: number
    currentStreak: number
    level: number
    experienceEarned: number
  }
}



export default function Achievements({ achievements = [], playerStats }: AchievementsProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычное'
      case 'rare': return 'Редкое'
      case 'epic': return 'Эпическое'
      case 'legendary': return 'Легендарное'
      default: return 'Неизвестно'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'quests': return 'Квесты'
      case 'streaks': return 'Стрики'
      case 'progression': return 'Прогресс'
      case 'special': return 'Особые'
      case 'legendary': return 'Легендарные'
      default: return 'Разное'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quests': return '⚔️'
      case 'streaks': return '🔥'
      case 'progression': return '📈'
      case 'special': return '⭐'
      case 'legendary': return '👑'
      default: return '🏆'
    }
  }

  const achievementsByCategory = {
    quests: achievements.filter(a => a.category === 'quests'),
    streaks: achievements.filter(a => a.category === 'streaks'),
    progression: achievements.filter(a => a.category === 'progression'),
    special: achievements.filter(a => a.category === 'special'),
    legendary: achievements.filter(a => a.category === 'legendary')
  }

  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const progressPercent = (unlockedAchievements / totalAchievements) * 100

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progressPercent = (achievement.progress / achievement.maxProgress) * 100
    const isComplete = achievement.progress >= achievement.maxProgress

    return (
      <Card className={`bg-white/5 border-white/10 transition-all hover:bg-white/10 ${achievement.unlocked ? 'ring-2 ring-green-500/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`text-4xl p-2 rounded-lg ${achievement.unlocked ? 'bg-green-500/20' : 'bg-gray-500/20'} transition-all`}>
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {achievement.name}
                </h3>
                <Badge className={getRarityColor(achievement.rarity)}>
                  {getRarityName(achievement.rarity)}
                </Badge>
              </div>
              <p className={`text-sm ${achievement.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Прогресс</span>
              <span className={achievement.unlocked ? 'text-green-400' : 'text-white'}>
                {Math.min(achievement.progress, achievement.maxProgress)}/{achievement.maxProgress}
              </span>
            </div>
            <Progress 
              value={Math.min(progressPercent, 100)} 
              className={`h-2 ${achievement.unlocked ? 'bg-green-500/20' : ''}`}
            />
          </div>

          {/* Unlock Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="text-xs text-green-400 mb-3">
              ✅ Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
            </div>
          )}

          {/* Reward */}
          {achievement.reward && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400">Награда:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="text-blue-300">
                  ⭐ {achievement.reward.exp} опыта
                </Badge>
                {achievement.reward.coins?.gold && (
                  <Badge variant="outline" className="text-yellow-300">
                    🥇 {achievement.reward.coins.gold}
                  </Badge>
                )}
                {achievement.reward.coins?.silver && (
                  <Badge variant="outline" className="text-gray-300">
                    🥈 {achievement.reward.coins.silver}
                  </Badge>
                )}
                {achievement.reward.coins?.bronze && (
                  <Badge variant="outline" className="text-orange-300">
                    🥉 {achievement.reward.coins.bronze}
                  </Badge>
                )}
                {achievement.reward.title && (
                  <Badge variant="outline" className="text-purple-300">
                    👑 "{achievement.reward.title}"
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">🏆 Общий прогресс достижений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-white mb-2">
              {unlockedAchievements}/{totalAchievements}
            </div>
            <div className="text-slate-300">Достижений разблокировано</div>
          </div>
          <Progress value={progressPercent} className="h-4 mb-2" />
          <div className="text-center text-sm text-slate-400">
            {progressPercent.toFixed(1)}% завершено
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {unlockedAchievements > 0 && (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">🌟 Недавние достижения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {achievements
                .filter(a => a.unlocked)
                .sort((a, b) => new Date(b.unlockedAt || '').getTime() - new Date(a.unlockedAt || '').getTime())
                .slice(0, 3)
                .map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{achievement.name}</div>
                      <div className="text-sm text-slate-300">{achievement.description}</div>
                      <div className="text-xs text-green-400">
                        Получено: {new Date(achievement.unlockedAt || '').toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {getRarityName(achievement.rarity)}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-white/10">
          <TabsTrigger value="all">🏆 Все</TabsTrigger>
          <TabsTrigger value="quests">⚔️</TabsTrigger>
          <TabsTrigger value="streaks">🔥</TabsTrigger>
          <TabsTrigger value="progression">📈</TabsTrigger>
          <TabsTrigger value="special">⭐</TabsTrigger>
          <TabsTrigger value="legendary">👑</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements
              .sort((a, b) => {
                // Сначала разблокированные, потом по близости к завершению
                if (a.unlocked && !b.unlocked) return -1
                if (!a.unlocked && b.unlocked) return 1
                if (!a.unlocked && !b.unlocked) {
                  const aProgress = a.progress / a.maxProgress
                  const bProgress = b.progress / b.maxProgress
                  return bProgress - aProgress
                }
                return 0
              })
              .map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </div>
        </TabsContent>

        {(['quests', 'streaks', 'progression', 'special', 'legendary'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievementsByCategory[category]
                    .sort((a, b) => {
                      if (a.unlocked && !b.unlocked) return -1
                      if (!a.unlocked && b.unlocked) return 1
                      if (!a.unlocked && !b.unlocked) {
                        const aProgress = a.progress / a.maxProgress
                        const bProgress = b.progress / b.maxProgress
                        return bProgress - aProgress
                      }
                      return 0
                    })
                    .map(achievement => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                </div>
                
                {achievementsByCategory[category].length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
                    <p className="text-slate-400">В этой категории пока нет достижений</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Achievement Tips */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">💡 Как получать достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-green-400">🎯 Регулярность</h4>
              <p className="text-sm text-slate-300">
                Выполняйте квесты каждый день, чтобы получить достижения за стрики и дисциплину.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-blue-400">🎨 Разнообразие</h4>
              <p className="text-sm text-slate-300">
                Пробуйте разные типы квестов: творческие, образовательные, физические.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-purple-400">⭐ Качество</h4>
              <p className="text-sm text-slate-300">
                Выполняйте квесты хорошо с первого раза, чтобы получить особые достижения.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-yellow-400">👑 Упорство</h4>
              <p className="text-sm text-slate-300">
                Самые ценные достижения требуют времени и постоянства. Не сдавайтесь!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
