'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  category: 'reward' | 'title' | 'consumable' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  quantity: number
  usable: boolean
  used?: boolean
  obtainedAt: string
  expiresAt?: string
}

interface InventoryProps {
  items: InventoryItem[]
  playerTitles: string[]
  activeTitle?: string
  onUseItem: (itemId: string) => void
  onEquipTitle: (title: string) => void
}

export default function Inventory({ 
  items = [], // Пустой массив вместо мока 
  playerTitles = [], // Пустой массив вместо мока
  activeTitle = 'Новичок',
  onUseItem,
  onEquipTitle 
}: InventoryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reward': return 'bg-green-500/20 text-green-300'
      case 'title': return 'bg-purple-500/20 text-purple-300'
      case 'consumable': return 'bg-orange-500/20 text-orange-300'
      case 'special': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'reward': return 'Награды'
      case 'title': return 'Титулы'
      case 'consumable': return 'Расходуемые'
      case 'special': return 'Особые'
      default: return 'Разное'
    }
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory
  })

  const itemsByCategory = {
    reward: items.filter(item => item.category === 'reward'),
    consumable: items.filter(item => item.category === 'consumable'),
    special: items.filter(item => item.category === 'special')
  }

  const usedItems = items.filter(item => item.used)
  const activeItems = items.filter(item => !item.used)

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiresAt) return false
    const expireDate = new Date(item.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (item: InventoryItem) => {
    if (!item.expiresAt) return false
    return new Date(item.expiresAt) < new Date()
  }

  const InventoryItemCard = ({ item }: { item: InventoryItem }) => {
    const expiring = isExpiringSoon(item)
    const expired = isExpired(item)

    return (
      <Card className={`bg-white/5 border-white/10 transition-all hover:bg-white/10 ${item.used ? 'opacity-60' : ''} ${expired ? 'border-red-500/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`text-4xl p-2 rounded-lg ${item.used || expired ? 'bg-gray-500/20' : 'bg-green-500/20'}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-bold ${item.used || expired ? 'text-gray-400' : 'text-white'}`}>
                  {item.name}
                </h3>
                <Badge className={getRarityColor(item.rarity)}>
                  {item.rarity === 'common' ? 'Обычное' :
                   item.rarity === 'rare' ? 'Редкое' :
                   item.rarity === 'epic' ? 'Эпическое' : 'Легендарное'}
                </Badge>
              </div>
              <p className={`text-sm ${item.used || expired ? 'text-slate-500' : 'text-slate-300'}`}>
                {item.description}
              </p>
              
              {item.quantity > 1 && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    Количество: {item.quantity}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 mb-3">
            <Badge className={getCategoryColor(item.category)}>
              {getCategoryName(item.category)}
            </Badge>
            
            {item.used && (
              <Badge className="bg-red-500/20 text-red-300">
                Использовано
              </Badge>
            )}
            
            {expired && (
              <Badge className="bg-red-500/20 text-red-300">
                Истекло
              </Badge>
            )}
            
            {expiring && (
              <Badge className="bg-yellow-500/20 text-yellow-300">
                Истекает скоро
              </Badge>
            )}
          </div>

          {/* Expiry Info */}
          {item.expiresAt && !expired && (
            <div className="text-xs text-slate-400 mb-3">
              Истекает: {new Date(item.expiresAt).toLocaleDateString('ru-RU')}
            </div>
          )}

          {/* Obtained Date */}
          <div className="text-xs text-slate-500 mb-3">
            Получено: {new Date(item.obtainedAt).toLocaleDateString('ru-RU')}
          </div>

          {/* Action Button */}
          {item.usable && !item.used && !expired && (
            <Button
              className="w-full"
              onClick={() => onUseItem(item.id)}
              variant={item.category === 'consumable' ? 'destructive' : 'default'}
            >
              {item.category === 'consumable' ? '🔥 Использовать' : '🎁 Активировать'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const TitleCard = ({ title, isActive }: { title: string; isActive: boolean }) => (
    <Card className={`bg-white/5 border-white/10 transition-all hover:bg-white/10 ${isActive ? 'ring-2 ring-purple-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">👑</div>
          <h3 className={`font-bold mb-2 ${isActive ? 'text-purple-300' : 'text-white'}`}>
            {title}
          </h3>
          {isActive && (
            <Badge className="bg-purple-500/20 text-purple-300 mb-3">
              Активен
            </Badge>
          )}
          {!isActive && (
            <Button
              className="w-full"
              onClick={() => onEquipTitle(title)}
              variant="outline"
            >
              Экипировать
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">🎒 Сводка инвентаря</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeItems.length}</div>
              <div className="text-sm text-slate-400">Активные предметы</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{usedItems.length}</div>
              <div className="text-sm text-slate-400">Использовано</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{playerTitles.length}</div>
              <div className="text-sm text-slate-400">Титулов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {items.filter(item => item.rarity === 'legendary').length}
              </div>
              <div className="text-sm text-slate-400">Легендарных</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Warning */}
      {items.some(item => isExpiringSoon(item)) && (
        <Card className="bg-yellow-500/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-yellow-300 mb-1">Предметы истекают скоро!</h3>
                <p className="text-yellow-200 text-sm">
                  У вас есть предметы, которые истекают в течение недели. Используйте их, пока не поздно!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 bg-white/10">
          <TabsTrigger value="all">🎒 Все</TabsTrigger>
          <TabsTrigger value="reward">🎁 Награды</TabsTrigger>
          <TabsTrigger value="consumable">🔥 Расходуемые</TabsTrigger>
          <TabsTrigger value="special">⭐ Особые</TabsTrigger>
          <TabsTrigger value="title">👑 Титулы</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .sort((a, b) => {
                // Сначала неиспользованные, потом по дате получения
                if (!a.used && b.used) return -1
                if (a.used && !b.used) return 1
                return new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime()
              })
              .map(item => (
                <InventoryItemCard key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="reward" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">🎁 Награды</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itemsByCategory.reward.map(item => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumable" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">🔥 Расходуемые предметы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itemsByCategory.consumable.map(item => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
              {itemsByCategory.consumable.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔥</div>
                  <p className="text-slate-400">Нет расходуемых предметов</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">⭐ Особые предметы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itemsByCategory.special.map(item => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="title" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">👑 Титулы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {playerTitles.map(title => (
                  <TitleCard 
                    key={title} 
                    title={title} 
                    isActive={title === activeTitle}
                  />
                ))}
              </div>
              {playerTitles.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👑</div>
                  <p className="text-slate-400 mb-4">У вас пока нет титулов</p>
                  <p className="text-sm text-slate-500">Получайте достижения, чтобы разблокировать титулы!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inventory Tips */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">💡 Советы по инвентарю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-green-400">🎁 Награды</h4>
              <p className="text-sm text-slate-300">
                Активируйте награды, когда готовы их использовать. Обратитесь к родителям для получения.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-orange-400">🔥 Расходуемые</h4>
              <p className="text-sm text-slate-300">
                Используйте в нужный момент для временных бонусов. После использования исчезают навсегда.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-purple-400">👑 Титулы</h4>
              <p className="text-sm text-slate-300">
                Показывают ваши достижения. Экипируйте понравившийся титул, чтобы все его видели.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-yellow-400">⭐ Особые</h4>
              <p className="text-sm text-slate-300">
                Редкие и ценные предметы за выдающиеся достижения. Берегите их!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
