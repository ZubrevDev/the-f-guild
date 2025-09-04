import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  count?: number
  isActive?: boolean
}

function NavItem({ href, icon, label, count, isActive }: NavItemProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/15" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-auto bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </Link>
  )
}

interface DashboardNavProps {
  userRole?: 'dm' | 'player'
}

export function DashboardNav({ userRole = 'dm' }: DashboardNavProps) {
  const pathname = usePathname()

  if (userRole === 'player') {
    return (
      <nav className="space-y-1 px-2">
        <NavItem 
          href="/player"
          icon={<span className="text-lg">⚔️</span>}
          label="Персонаж"
          isActive={pathname === '/player'}
        />
        <NavItem 
          href="/player/quests"
          icon={<span className="text-lg">🎯</span>}
          label="Квесты"
          isActive={pathname === '/player/quests'}
          count={5}
        />
        <NavItem 
          href="/player/shop"
          icon={<span className="text-lg">🛒</span>}
          label="Магазин"
          isActive={pathname === '/player/shop'}
        />
        <NavItem 
          href="/player/achievements"
          icon={<span className="text-lg">🏆</span>}
          label="Достижения"
          isActive={pathname === '/player/achievements'}
        />
        <NavItem 
          href="/player/inventory"
          icon={<span className="text-lg">🎒</span>}
          label="Инвентарь"
          isActive={pathname === '/player/inventory'}
          count={8}
        />
        <NavItem 
          href="/guild"
          icon={<span className="text-lg">🏰</span>}
          label="Гильдия"
          isActive={pathname === '/guild'}
        />
      </nav>
    )
  }

  return (
    <nav className="space-y-1 px-2">
      <NavItem 
        href="/dm"
        icon={<span className="text-lg">🎯</span>}
        label="Обзор"
        isActive={pathname === '/dm'}
      />
      <NavItem 
        href="/dm/quests"
        icon={<span className="text-lg">⚔️</span>}
        label="Квесты"
        isActive={pathname === '/dm/quests'}
        count={3}
      />
      <NavItem 
        href="/dm/players"
        icon={<span className="text-lg">👥</span>}
        label="Игроки"
        isActive={pathname === '/dm/players'}
      />
      <NavItem 
        href="/dm/shop"
        icon={<span className="text-lg">🏪</span>}
        label="Магазин"
        isActive={pathname === '/dm/shop'}
      />
      <NavItem 
        href="/dm/effects"
        icon={<span className="text-lg">✨</span>}
        label="Эффекты"
        isActive={pathname === '/dm/effects'}
      />
      <NavItem 
        href="/dm/settings"
        icon={<span className="text-lg">⚙️</span>}
        label="Настройки"
        isActive={pathname === '/dm/settings'}
      />
      <NavItem 
        href="/guild"
        icon={<span className="text-lg">🏰</span>}
        label="Гильдия"
        isActive={pathname === '/guild'}
      />
    </nav>
  )
}
