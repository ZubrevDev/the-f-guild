'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  category: 'reward' | 'title' | 'consumable' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  quantity: number
  usable: boolean
  used: boolean
  obtainedAt: string
  expiresAt?: string
}

export default function PlayerInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [playerTitles, setPlayerTitles] = useState<string[]>([])
  const [activeTitle, setActiveTitle] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // В реальном приложении это будет браться из сессии
  const characterId = 'char-alice' // ID персонажа Алисы

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setError(null)
      
      const response = await fetch(`/api/inventory?characterId=${characterId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }
      
      const data = await response.json()
      setItems(data.items)
      setPlayerTitles(data.playerTitles)
      setActiveTitle(data.activeTitle)

    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError('Ошибка загрузки инвентаря')
      toast.error('Ошибка загрузки инвентаря')
    } finally {
      setLoading(false)
    }
  }

  const handleUseItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'use_item',
          itemId,
          characterId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to use item')
      }

      toast.success('Предмет использован!')
      fetchInventory() // Refresh inventory
    } catch (error) {
      console.error('Error using item:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка использования предмета')
    }
  }

  const handleEquipTitle = async (title: string) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'equip_title',
          title,
          characterId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to equip title')
      }

      setActiveTitle(title)
      toast.success(`Титул "${title}" экипирован!`)
    } catch (error) {
      console.error('Error equipping title:', error)
      toast.error('Ошибка экипировки титула')
    }
  }

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
      case 'title': return 'bg-yellow-500/20 text-yellow-300'
      case 'consumable': return 'bg-blue-500/20 text-blue-300'
      case 'special': return 'bg-purple-500/20 text-purple-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date() > new Date(expiresAt)
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory
  })

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">🎒 Загружаем инвентарь...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ {error}</div>
          <Button onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎒 Инвентарь</h1>
          <p className="text-slate-300">Управляйте своими предметами и титулами</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Filter */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🗂️ Категории</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все предметы</SelectItem>
                    <SelectItem value="reward">🎁 Награды</SelectItem>
                    <SelectItem value="title">👑 Титулы</SelectItem>
                    <SelectItem value="consumable">⚗️ Расходуемые</SelectItem>
                    <SelectItem value="special">✨ Особые</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Active Title */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">👑 Активный титул</CardTitle>
              </CardHeader>
              <CardContent>
                {activeTitle ? (
                  <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <div className="text-yellow-300 font-bold">{activeTitle}</div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">Титул не выбран</div>
                )}
                
                {playerTitles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-bold mb-2">Доступные титулы:</h4>
                    <div className="space-y-2">
                      {playerTitles.map(title => (
                        <button
                          key={title}
                          onClick={() => handleEquipTitle(title)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            title === activeTitle 
                              ? 'bg-yellow-500/30 text-yellow-300' 
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white">📊 Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Всего предметов:</span>
                  <span className="text-white font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Использованных:</span>
                  <span className="text-white font-bold">{items.filter(i => i.used).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Титулов:</span>
                  <span className="text-white font-bold">{playerTitles.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {Object.keys(groupedItems).length === 0 ? (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">🎒</div>
                  <h3 className="text-xl font-bold text-white mb-2">Инвентарь пуст</h3>
                  <p className="text-slate-400">Выполняйте квесты и покупайте предметы в магазине!</p>
                  <Button className="mt-4" asChild>
                    <a href="/player/shop">Открыть магазин</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                      {category === 'reward' && '🎁 Награды'}
                      {category === 'title' && '👑 Титулы'}
                      {category === 'consumable' && '⚗️ Расходуемые предметы'}
                      {category === 'special' && '✨ Особые предметы'}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {categoryItems.map((item) => (
                        <Card key={item.id} className={`bg-white/10 backdrop-blur border-white/20 ${isExpired(item.expiresAt) ? 'opacity-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-3xl">{item.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-white">{item.name}</h3>
                                  {item.quantity > 1 && (
                                    <Badge variant="secondary" className="text-xs">
                                      x{item.quantity}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2 mb-2">
                                  <Badge className={getRarityColor(item.rarity)}>
                                    {item.rarity}
                                  </Badge>
                                  <Badge className={getCategoryColor(item.category)}>
                                    {item.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 mb-3">{item.description}</p>
                            
                            <div className="text-xs text-slate-400 mb-3">
                              <div>Получено: {formatDate(item.obtainedAt)}</div>
                              {item.expiresAt && (
                                <div className={isExpired(item.expiresAt) ? 'text-red-400' : ''}>
                                  Истекает: {formatDate(item.expiresAt)}
                                  {isExpired(item.expiresAt) && ' (истек)'}
                                </div>
                              )}
                            </div>
                            
                            {item.usable && !item.used && !isExpired(item.expiresAt) && (
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleUseItem(item.id)}
                              >
                                Использовать
                              </Button>
                            )}
                            
                            {item.used && (
                              <Badge variant="secondary" className="w-full justify-center">
                                Использовано
                              </Badge>
                            )}
                            
                            {isExpired(item.expiresAt) && (
                              <Badge variant="destructive" className="w-full justify-center">
                                Просрочено
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
