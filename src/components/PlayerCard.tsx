import { Card, CardContent, CardHeader } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"

interface PlayerCardProps {
  name: string
  level: number
  experience: {
    current: number
    total: number
  }
  class: string
  questsToday: number
  effects: Array<{
    name: string
    duration: string
    type: 'buff' | 'debuff'
  }>
  coins: {
    bronze: number
    silver: number
    gold: number
  }
}

export function PlayerCard({
  name,
  level,
  experience,
  class: playerClass,
  questsToday,
  effects,
  coins
}: PlayerCardProps) {
  return (
    <Card className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">⚔️</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{playerClass}</Badge>
              <span className="text-sm text-muted-foreground">Уровень {level}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Опыт</span>
              <span>{experience.current}/{experience.total}</span>
            </div>
            <Progress value={(experience.current / experience.total) * 100} className="h-2" />
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">🥇</span>
              <span>{coins.gold}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">🥈</span>
              <span>{coins.silver}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-amber-600">🥉</span>
              <span>{coins.bronze}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {effects.map((effect) => (
              <Badge 
                key={effect.name}
                variant={effect.type === 'buff' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {effect.name} ({effect.duration})
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
