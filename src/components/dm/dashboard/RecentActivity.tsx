import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle,
  CheckCircle,
  Crown,
  Sparkles
} from 'lucide-react'
import { ActivityItem } from './types'

interface RecentActivityProps {
  activities?: ActivityItem[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const handleApprove = (activityId: string) => {
    console.log('Одобрение действия:', activityId)
    // Здесь можно добавить API вызов для одобрения
    alert(`Действие ${activityId} одобрено!`)
  }

  // Используем только переданные activities или пустой массив
  const activityList = activities || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quest_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'level_up':
        return <Crown className="w-4 h-4 text-blue-400" />
      case 'effect_applied':
        return <Sparkles className="w-4 h-4 text-purple-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quest_completed':
        return 'bg-green-500/20'
      case 'level_up':
        return 'bg-blue-500/20'
      case 'effect_applied':
        return 'bg-purple-500/20'
      default:
        return 'bg-blue-500/20'
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-400" />
          Недавняя активность
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityList.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-slate-400 text-xs">{activity.time}</p>
                </div>
              </div>
              {activity.actionRequired && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(activity.id)}
                >
                  Одобрить
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
