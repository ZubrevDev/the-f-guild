import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface Effect {
  id: string
  name: string
  description: string
  type: 'buff' | 'debuff'
  icon: string
}

interface EffectsGridProps {
  effects: Effect[]
}

export function EffectsGrid({ effects }: EffectsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {effects.map((effect) => (
        <Card 
          key={effect.id}
          className={`
            transition-colors hover:bg-primary/5 cursor-pointer
            ${effect.type === 'buff' ? 'border-green-500/20' : 'border-red-500/20'}
          `}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center text-base font-medium">
              <span className="mr-2 text-xl">{effect.icon}</span>
              {effect.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{effect.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
