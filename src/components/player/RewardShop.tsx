'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface RewardShopProps {
  playerCoins: {
    gold: number
    silver: number
    bronze: number
  }
  activeEffects: Array<{
    id: string
    type: string
    effects: any
  }>
  onPurchase: (itemId: string, cost: { type: 'gold' | 'silver' | 'bronze', amount: number }) => void
}

interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  category: string
  cost: {
    type: 'gold' | 'silver' | 'bronze'
    amount: number
  }
  availability: 'always' | 'limited' | 'special'
  stock?: number
  cooldown?: number
}

const shopItems: ShopItem[] = [
  // Развлечения
  {
    id: 'phone_30min',
    name: '30 минут телефона',
    description: 'Дополнительное время с любимыми играми',
    icon: '📱',
    category: 'entertainment',
    cost: { type: 'silver', amount: 3 },
    availability: 'always'
  },
  {
    id: 'games_1hour',
    name: '1 час игр',
    description: 'Время для любимых видеоигр',
    icon: '🎮',
    category: 'entertainment',
    cost: { type: 'gold', amount: 1 },
    availability: 'always'
  },
  {
    id: 'tv_movie',
    name: 'Фильм на выбор',
    description: 'Посмотреть любимый фильм вечером',
    icon: '🎬',
    category: 'entertainment',
    cost: { type: 'silver', amount: 4 },
    availability: 'always'
  },
  {
    id: 'late_bedtime',
    name: 'Поздний отбой',
    description: 'Лечь спать на час позже',
    icon: '🛏️',
    category: 'entertainment',
    cost: { type: 'bronze', amount: 10 },
    availability: 'always'
  },

  // Покупки
  {
    id: 'pocket_money_1',
    name: '1 евро',
    description: 'Реальные деньги на карманные расходы',
    icon: '💰',
    category: 'money',
    cost: { type: 'gold', amount: 1 },
    availability: 'always'
  },
  {
    id: 'pocket_money_5',
    name: '5 евро',
    description: 'Больше денег на личные покупки',
    icon: '💵',
    category: 'money',
    cost: { type: 'gold', amount: 4 },
    availability: 'limited',
    stock: 1
  },
  {
    id: 'toy_small',
    name: 'Маленькая игрушка',
    description: 'Игрушка до 10 евро на выбор',
    icon: '🧸',
    category: 'money',
    cost: { type: 'gold', amount: 8 },
    availability: 'limited',
    stock: 1
  },

  // Активности
  {
    id: 'cinema_family',
    name: 'Поход в кино',
    description: 'Семейный поход в кинотеатр',
    icon: '🍿',
    category: 'activities',
    cost: { type: 'gold', amount: 3 },
    availability: 'limited',
    stock: 1
  },
  {
    id: 'museum_visit',
    name: 'Поход в музей',
    description: 'Познавательная экскурсия',
    icon: '🏛️',
    category: 'activities',
    cost: { type: 'gold', amount: 2 },
    availability: 'always'
  },
  {
    id: 'park_picnic',
    name: 'Пикник в парке',
    description: 'Семейный отдых на природе',
    icon: '🧺',
    category: 'activities',
    cost: { type: 'silver', amount: 8 },
    availability: 'always'
  },

  // Творчество
  {
    id: 'art_supplies',
    name: 'Набор для творчества',
    description: 'Новые материалы для рисования',
    icon: '🎨',
    category: 'creative',
    cost: { type: 'silver', amount: 5 },
    availability: 'always'
  },
  {
    id: 'craft_kit',
    name: 'Набор для поделок',
    description: 'Все необходимое для creative проектов',
    icon: '✂️',
    category: 'creative',
    cost: { type: 'silver', amount: 6 },
    availability: 'always'
  },

  // Особые награды
  {
    id: 'choose_dinner',
    name: 'Выбор ужина',
    description: 'Решаешь, что вся семья будет есть на ужин',
    icon: '🍽️',
    category: 'special',
    cost: { type: 'bronze', amount: 15 },
    availability: 'always'
  },
  {
    id: 'skip_chore',
    name: 'Пропуск обязанности',
    description: 'Пропустить одну домашнюю обязанность',
    icon: '🏃‍♂️',
    category: 'special',
    cost: { type: 'silver', amount: 7 },
    availability: 'limited',
    stock: 2
  },
  {
    id: 'weekend_adventure',
    name: 'Семейное приключение',
    description: 'Целый день посвящен твоим интересам',
    icon: '🗺️',
    category: 'special',
    cost: { type: 'gold', amount: 10 },
    availability: 'special',
    stock: 1
  }
]

export default function RewardShop({ playerCoins, activeEffects, onPurchase }: RewardShopProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entertainment': return '🎮'
      case 'money': return '💰'
      case 'activities': return '🎯'
      case 'creative': return '🎨'
      case 'special': return '⭐'
      default: return '🛒'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'entertainment': return 'Развлечения'
      case 'money': return 'Деньги'
      case 'activities': return 'Активности'
      case 'creative': return 'Творчество'
      case 'special': return 'Особые'
      default: return 'Все'
    }
  }

  const getCoinIcon = (type: string) => {
    switch (type) {
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      case 'bronze': return '🥉'
      default: return '💰'
    }
  }

  const getCoinColor = (type: string) => {
    switch (type) {
      case 'gold': return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30'
      case 'silver': return 'text-gray-300 bg-gray-500/20 border-gray-500/30'
      case 'bronze': return 'text-orange-300 bg-orange-500/20 border-orange-500/30'
      default: return 'text-blue-300 bg-blue-500/20 border-blue-500/30'
    }
  }

  const checkShopBlocked = () => {
    // Проверяем что activeEffects существует и является массивом
    if (!activeEffects || !Array.isArray(activeEffects)) return false
    return activeEffects.some(effect => effect.effects?.shopBlocked)
  }

  const canAfford = (cost: { type: 'gold' | 'silver' | 'bronze', amount: number }) => {
    return playerCoins[cost.type] >= cost.amount
  }

  const filteredItems = shopItems.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory
  })

  const handlePurchase = (item: ShopItem) => {
    if (checkShopBlocked()) {
      toast.error('🚫 Магазин заблокирован вашими эффектами!')
      return
    }

    if (!canAfford(item.cost)) {
      toast.error('💸 Недостаточно средств!')
      return
    }

    onPurchase(item.id, item.cost)
    toast.success(`🛒 Куплено: ${item.name}! Обратитесь к родителям для получения награды.`)
  }

  const ShopItemCard = ({ item }: { item: ShopItem }) => {
    const affordable = canAfford(item.cost)
    const shopBlocked = checkShopBlocked()

    return (
      <Card className={`bg-white/5 border-white/10 transition-all hover:bg-white/10 ${!affordable || shopBlocked ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-white mb-2">{item.name}</h3>
            <p className="text-sm text-slate-300 mb-3">{item.description}</p>
          </div>

          <div className="flex justify-center mb-4">
            <Badge className={`${getCoinColor(item.cost.type)} border`}>
              {getCoinIcon(item.cost.type)} {item.cost.amount} {item.cost.type === 'gold' ? 'золота' : item.cost.type === 'silver' ? 'серебра' : 'бронзы'}
            </Badge>
          </div>

          {item.availability === 'limited' && item.stock !== undefined && (
            <div className="text-center mb-3">
              <Badge variant="outline" className="text-xs">
                📦 Осталось: {item.stock}
              </Badge>
            </div>
          )}

          {item.availability === 'special' && (
            <div className="text-center mb-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                ⭐ Особая награда
              </Badge>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => handlePurchase(item)}
            disabled={!affordable || shopBlocked || (item.stock !== undefined && item.stock <= 0)}
            variant={affordable && !shopBlocked ? "default" : "outline"}
          >
            {shopBlocked ? '🚫 Заблокировано' : 
             !affordable ? '💸 Недостаточно средств' :
             item.stock !== undefined && item.stock <= 0 ? '📭 Нет в наличии' :
             '🛒 Купить'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Currency Display */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">💰 Ваши средства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-6">
            <div className="text-center bg-yellow-500/20 px-6 py-4 rounded-lg border border-yellow-500/30">
              <div className="text-4xl mb-2">🥇</div>
              <div className="font-bold text-yellow-300 text-2xl">{playerCoins.gold}</div>
              <div className="text-sm text-slate-400">Золото</div>
            </div>
            <div className="text-center bg-gray-500/20 px-6 py-4 rounded-lg border border-gray-500/30">
              <div className="text-4xl mb-2">🥈</div>
              <div className="font-bold text-gray-300 text-2xl">{playerCoins.silver}</div>
              <div className="text-sm text-slate-400">Серебро</div>
            </div>
            <div className="text-center bg-orange-500/20 px-6 py-4 rounded-lg border border-orange-500/30">
              <div className="text-4xl mb-2">🥉</div>
              <div className="font-bold text-orange-300 text-2xl">{playerCoins.bronze}</div>
              <div className="text-sm text-slate-400">Бронза</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Blocked Warning */}
      {checkShopBlocked() && (
        <Card className="bg-red-500/20 border-red-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-4xl mb-2">🚫</div>
            <h3 className="text-lg font-bold text-red-300 mb-2">Магазин заблокирован</h3>
            <p className="text-red-200 text-sm">
              Ваши активные эффекты блокируют доступ к магазину. Исправьте поведение, чтобы снять блокировку!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6 bg-white/10">
          <TabsTrigger value="all">🛒 Все</TabsTrigger>
          <TabsTrigger value="entertainment">🎮</TabsTrigger>
          <TabsTrigger value="money">💰</TabsTrigger>
          <TabsTrigger value="activities">🎯</TabsTrigger>
          <TabsTrigger value="creative">🎨</TabsTrigger>
          <TabsTrigger value="special">⭐</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-white mb-2">Пусто</h3>
                <p className="text-slate-400 mb-4">В этой категории пока нет товаров.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('all')}
                >
                  Показать все товары
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Shopping Tips */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">💡 Советы по покупкам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-green-400">🥉 Бронза</h4>
              <p className="text-sm text-slate-300">
                Легко заработать за ежедневные задания. Подходит для небольших удовольствий.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-400">🥈 Серебро</h4>
              <p className="text-sm text-slate-300">
                Заработать сложнее. Хорошо подходит для особых развлечений и покупок.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-yellow-400">🥇 Золото</h4>
              <p className="text-sm text-slate-300">
                Самая ценная валюта! Тратьте мудро на крупные покупки и приключения.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-purple-400">⭐ Особые награды</h4>
              <p className="text-sm text-slate-300">
                Ограниченные предложения за исключительные достижения!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
