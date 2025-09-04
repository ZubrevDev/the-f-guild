import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Target, 
  Clock, 
  CheckCircle
} from 'lucide-react'
import { GuildStats } from './types'

interface StatsCardsProps {
  stats: Pick<GuildStats, 'totalPlayers' | 'activeQuests' | 'pendingApproval' | 'completedToday'>
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: 'Активные игроки',
      value: stats.totalPlayers,
      description: 'В вашей гильдии',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Активные квесты',
      value: stats.activeQuests,
      description: 'Ожидают выполнения',
      icon: Target,
      color: 'text-green-400'
    },
    {
      title: 'Ожидают проверки',
      value: stats.pendingApproval,
      description: 'Требуют внимания',
      icon: Clock,
      color: 'text-yellow-400',
      valueColor: 'text-yellow-400'
    },
    {
      title: 'Выполнено сегодня',
      value: stats.completedToday,
      description: 'Квестов завершено',
      icon: CheckCircle,
      color: 'text-green-400',
      valueColor: 'text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.valueColor || 'text-white'}`}>{stat.value}</div>
            <p className="text-xs text-slate-400">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
