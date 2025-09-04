import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Trophy
} from 'lucide-react'
import { GuildStats } from './types'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  stats: Pick<GuildStats, 'totalExperience' | 'completedToday'>
}

export default function QuickActions({ stats }: QuickActionsProps) {
  const router = useRouter()

  const handleQuickQuest = (questType: string) => {
    console.log('Создание быстрого квеста:', questType)
    // Переход к созданию нового квеста
    router.push(`/dm/quests?quick=${encodeURIComponent(questType)}`)
  }

  const handleEffect = (effectType: string) => {
    console.log('Применение эффекта:', effectType)
    // Переход к странице эффектов
    router.push(`/dm/effects?type=${encodeURIComponent(effectType)}`)
  }

  const handleStatistics = () => {
    console.log('Открытие статистики')
    // Показать подробную статистику
    alert('Подробная статистика будет доступна в следующих версиях')
  }

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Быстрые квесты */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">🎯 Быстрые квесты</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/20 hover:bg-white/10"
              onClick={() => handleQuickQuest('Новый квест')}
            >
              🎯 Создать квест
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-white/20 hover:bg-white/10"
              onClick={() => router.push('/dm/quests')}
            >
              📝 Все квесты
            </Button>
          </div>
        </div>

        {/* Эффекты */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">✨ Эффекты</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={() => handleEffect('blessing')}
            >
              ✨ Благословение
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => handleEffect('curse')}
            >
              💀 Проклятие
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              onClick={() => handleEffect('boost')}
            >
              🚀 Ускорение
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              onClick={() => handleEffect('protection')}
            >
              🛡️ Защита
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Сегодня выполнено</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {stats.completedToday || 0}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Общий опыт</span>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {stats.totalExperience || 0} XP
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-full text-slate-300 hover:bg-white/10"
            onClick={handleStatistics}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Подробная статистика
          </Button>
        </div>

        {/* Навигация */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">🧭 Навигация</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm"
              variant="outline" 
              className="border-white/20 hover:bg-white/10"
              onClick={() => router.push('/dm/players')}
            >
              👥 Игроки
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="border-white/20 hover:bg-white/10"
              onClick={() => router.push('/dm/shop')}
            >
              🏪 Магазин
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="border-white/20 hover:bg-white/10"
              onClick={() => router.push('/dm/effects')}
            >
              ✨ Эффекты
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="border-white/20 hover:bg-white/10"
              onClick={() => router.push('/dm/settings')}
            >
              ⚙️ Настройки
            </Button>
          </div>
        </div>

        {/* Награды */}
        <div>
          <Button 
            variant="outline" 
            className="w-full justify-center border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => router.push('/dm/shop')}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Управление наградами
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
