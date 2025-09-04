import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Eye, Settings } from 'lucide-react'
import { Player } from './types'
import { useRouter } from 'next/navigation'

interface PlayersOverviewProps {
  players: Player[]
}

export default function PlayersOverview({ players }: PlayersOverviewProps) {
  const router = useRouter()

  const handleAddPlayer = () => {
    console.log('Добавление нового игрока')
    router.push('/dm/players?action=add')
  }

  const handleViewProfile = (playerId: string) => {
    console.log('Просмотр профиля игрока:', playerId)
    router.push(`/dm/players?view=${playerId}`)
  }

  const handleManagePlayer = (playerId: string) => {
    console.log('Управление игроком:', playerId)
    router.push(`/dm/players?manage=${playerId}`)
  }
  const getEffectColor = (type: string) => {
    const colors = {
      blessing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      curse: 'bg-red-500/20 text-red-300 border-red-500/30',
      buff: 'bg-green-500/20 text-green-300 border-green-500/30',
      debuff: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    }
    return colors[type as keyof typeof colors] || 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  }

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-500'
  }

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">👥 Игроки гильдии</CardTitle>
            <CardDescription className="text-slate-400">
              Прогресс и статус ваших искателей приключений
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="border-white/20 hover:bg-white/10"
            onClick={handleAddPlayer}
          >
            <Plus className="w-4 h-4 mr-2" />
            Пригласить игрока
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!players || !Array.isArray(players) ? (
            <div className="text-center py-8 text-slate-400">
              <p>Игроки не найдены</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>В гильдии пока нет игроков</p>
              <p className="text-sm mt-2">Пригласите первого игрока!</p>
            </div>
          ) : (
            players.map((player) => (
            <div key={player.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-2xl">
                      {player.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(player.status)} rounded-full border-2 border-slate-900`} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{player.name}</h3>
                      <Badge variant="outline" className="text-xs border-white/20 text-slate-300">
                        {player.class}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>Уровень {player.level || 1}</span>
                      <span>•</span>
                      <span>{player.experience || 0}/{player.maxExperience || 100} опыта</span>
                      <span>•</span>
                      <span>{player.todayQuests || 0} квестов сегодня</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={((player.experience || 0) / (player.maxExperience || 1)) * 100} 
                        className="w-32 h-2"
                      />
                      <div className="flex space-x-2">
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          🥇 {player.coins?.gold || 0}
                        </span>
                        <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                          🥈 {player.coins?.silver || 0}
                        </span>
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                          🥉 {player.coins?.bronze || 0}
                        </span>
                      </div>
                    </div>
                    
                    {player.activeEffects && player.activeEffects.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {player.activeEffects.map((effect, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className={`text-xs ${getEffectColor(effect.type)}`}
                          >
                            {effect.name} ({effect.duration}д)
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/20 hover:bg-white/10"
                    onClick={() => handleViewProfile(player.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Профиль
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/20 hover:bg-white/10"
                    onClick={() => handleManagePlayer(player.id)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Управление
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
