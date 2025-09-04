import { Progress } from '@/components/ui/progress'

interface GuildHeaderProps {
  guildLevel: number
  guildExperience: number
  maxGuildExperience: number
}

export default function GuildHeader({ guildLevel, guildExperience, maxGuildExperience }: GuildHeaderProps) {
  const guildProgress = (guildExperience / maxGuildExperience) * 100

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur border border-purple-500/30 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Добро пожаловать, Гилд-мастер! 👑
          </h1>
          <p className="text-slate-300">
            Управляйте своей семейной гильдией и следите за прогрессом искателей приключений
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-sm text-slate-300 mb-1">Уровень гильдии</div>
          <div className="text-2xl font-bold text-white">{guildLevel}</div>
          <Progress value={guildProgress} className="w-32 mt-2" />
          <div className="text-xs text-slate-400 mt-1">
            {guildExperience}/{maxGuildExperience} опыта
          </div>
        </div>
      </div>
    </div>
  )
}
