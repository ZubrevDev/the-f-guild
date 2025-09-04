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
  activeEffects?: Array<{
    id: string
    type: string
    effects?: {
      shopBlocked?: boolean
    }
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

// Предметы магазина должны загружаться из API
const shopItems: ShopItem[] = []

export default function RewardShop({ playerCoins, activeEffects, onPurchase }: RewardShopProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entertainment': return '🎮'
      case 'money': return '💰'
      case 'activities': return '🎯'
      case 'creative': return '🎨'
      case 'special': return '⭐'
      default: return '🏪'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'entertainment': return 'Развлечения'
      case 'money': return 'Деньги'
      case 'activities': return 'Активности'
      case 'creative': return 'Творчество'
      case 'special': return 'Особые'
      default: return 'Другое'
    }
  }

  const getCostColor = (type: string) => {
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
    toast.success(`✅ Куплено: ${item.name}`)
  }

  if (checkShopBlocked()) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              🚫 Магазин заблокирован
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300">
              Магазин наград временно недоступен из-за активных эффектов.
            </p>
            <div className="mt-4">
              <h4 className="text-red-400 font-medium mb-2">Активные блокировки:</h4>
              <div className="space-y-2">
                {activeEffects?.filter(e => e.effects?.shopBlocked).map(effect => (
                  <Badge key={effect.id} variant="destructive" className="mr-2">
                    {effect.type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Coins */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">💰 Ваши монеты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400">🥇</span>
              </div>
              <span className="text-white font-bold">{playerCoins.gold}</span>
              <span className="text-yellow-400">Золотые</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                <span className="text-gray-300">🥈</span>
              </div>
              <span className="text-white font-bold">{playerCoins.silver}</span>
              <span className="text-gray-300">Серебряные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400">🥉</span>
              </div>
              <span className="text-white font-bold">{playerCoins.bronze}</span>
              <span className="text-orange-400">Бронзовые</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-white/10">
          <TabsTrigger value="all">🏪 Все</TabsTrigger>
          <TabsTrigger value="entertainment">🎮</TabsTrigger>
          <TabsTrigger value="money">💰</TabsTrigger>
          <TabsTrigger value="activities">🎯</TabsTrigger>
          <TabsTrigger value="creative">🎨</TabsTrigger>
          <TabsTrigger value="special">⭐</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-xl font-bold text-white mb-2">Магазин пуст</h3>
                  <p className="text-slate-400">В данный момент товары недоступны</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <Card key={item.id} className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-slate-300 mt-2">{item.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <Badge className={getCostColor(item.cost.type)}>
                        {item.cost.amount} {item.cost.type === 'gold' ? '🥇' : item.cost.type === 'silver' ? '🥈' : '🥉'}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300">
                        {getCategoryName(item.category)}
                      </Badge>
                    </div>

                    <Button 
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford(item.cost)}
                      className="w-full"
                      variant={canAfford(item.cost) ? "default" : "secondary"}
                    >
                      {canAfford(item.cost) ? '💳 Купить' : '💸 Недостаточно средств'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {(['entertainment', 'money', 'activities', 'creative', 'special'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
                    <p className="text-slate-400">В этой категории пока нет товаров</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredItems.filter(item => item.category === category).map(item => (
                      <Card key={item.id} className="bg-white/5">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="text-2xl">{item.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">{item.name}</h4>
                              <p className="text-sm text-slate-300">{item.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Badge className={getCostColor(item.cost.type)}>
                              {item.cost.amount} {item.cost.type === 'gold' ? '🥇' : item.cost.type === 'silver' ? '🥈' : '🥉'}
                            </Badge>
                            <Button 
                              onClick={() => handlePurchase(item)}
                              disabled={!canAfford(item.cost)}
                              size="sm"
                              variant={canAfford(item.cost) ? "default" : "secondary"}
                            >
                              {canAfford(item.cost) ? 'Купить' : 'Недостаточно'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Shop Info */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">💡 Информация о магазине</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-yellow-400">🥇 Золотые монеты</h4>
              <p className="text-sm text-slate-300">
                Самая ценная валюта. Получается за сложные квесты и особые достижения.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-400">🥈 Серебряные монеты</h4>
              <p className="text-sm text-slate-300">
                Основная валюта. Получается за выполнение обычных квестов.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-orange-400">🥉 Бронзовые монеты</h4>
              <p className="text-sm text-slate-300">
                Легко получаемая валюта. Дается за простые ежедневные задания.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-purple-400">✨ Особые товары</h4>
              <p className="text-sm text-slate-300">
                Лимитированные товары с особыми возможностями и привилегиями.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
