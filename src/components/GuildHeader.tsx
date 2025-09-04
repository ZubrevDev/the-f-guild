interface GuildHeaderProps {
  name: string
  memberCount: number
  activeQuests: number
  completedToday: number
}

export function GuildHeader({ 
  name, 
  memberCount, 
  activeQuests, 
  completedToday 
}: GuildHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-x-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">🏰</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {memberCount} {memberCount === 1 ? 'участник' : 'участников'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-x-6">
        <div className="text-center">
          <p className="text-2xl font-medium">{activeQuests}</p>
          <p className="text-sm text-muted-foreground">Активных квестов</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-medium">{completedToday}</p>
          <p className="text-sm text-muted-foreground">Выполнено сегодня</p>
        </div>
      </div>
    </div>
  )
}
