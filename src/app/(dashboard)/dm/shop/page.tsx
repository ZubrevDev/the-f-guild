'use client'

import { useState, useEffect } from 'react'
import { useUserSession } from '@/hooks/useUserSession'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ShoppingBag, 
  Plus,
  Edit,
  Trash2,
  Star,
  Gift,
  Coins,
  Crown,
  Heart,
  Gamepad2,
  Book,
  Candy,
  Ticket
} from 'lucide-react'

interface Reward {
  id: string
  name: string
  description: string
  category: 'privilege' | 'item' | 'experience' | 'digital'
  icon: string
  price: {
    gold?: number
    silver?: number
    bronze?: number
  }
  availability: 'limited' | 'unlimited'
  stock?: number
  isActive: boolean
  createdAt: string
}

export default function ShopManagement() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const { guild, loading: sessionLoading } = useUserSession()
  const [newReward, setNewReward] = useState<Omit<Reward, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    category: 'item',
    icon: '🎁',
    price: { bronze: 5 },
    availability: 'unlimited',
    isActive: true
  })

  useEffect(() => {
    const fetchRewards = async () => {
      if (sessionLoading || !guild?.id) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/rewards?guildId=${guild.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch rewards')
        }
        
        const data = await response.json()
        setRewards(data.rewards || [])
        
      } catch (error) {
        console.error('Error fetching rewards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [guild?.id, sessionLoading])

  const handleCreateReward = async () => {
    if (!guild?.id) return
    
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: guild.id,
          ...newReward
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create reward')
      }
      
      const data = await response.json()
      setRewards([data.reward, ...rewards])
      setShowCreateDialog(false)
      setNewReward({
        name: '',
        description: '',
        category: 'item',
        icon: '🎁',
        price: { bronze: 5 },
        availability: 'unlimited',
        isActive: true
      })
      
    } catch (error) {
      console.error('Error creating reward:', error)
    }
  }

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setNewReward({
      name: reward.name,
      description: reward.description,
      category: reward.category,
      icon: reward.icon,
      price: reward.price,
      availability: reward.availability,
      stock: reward.stock,
      isActive: reward.isActive
    })
    setShowCreateDialog(true)
  }

  const handleUpdateReward = () => {
    if (!editingReward) return
    
    const updatedReward: Reward = {
      ...editingReward,
      ...newReward
    }
    
    setRewards(rewards.map(r => r.id === editingReward.id ? updatedReward : r))
    setShowCreateDialog(false)
    setEditingReward(null)
    setNewReward({
      name: '',
      description: '',
      category: 'item',
      icon: '🎁',
      price: { bronze: 5 },
      availability: 'unlimited',
      isActive: true
    })
  }

  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter(r => r.id !== rewardId))
  }

  const toggleRewardActive = (rewardId: string) => {
    setRewards(rewards.map(r => 
      r.id === rewardId ? { ...r, isActive: !r.isActive } : r
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      privilege: 'bg-blue-500/20 text-blue-300',
      item: 'bg-green-500/20 text-green-300',
      experience: 'bg-purple-500/20 text-purple-300',
      digital: 'bg-yellow-500/20 text-yellow-300'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300'
  }

  const getCategoryName = (category: string) => {
    const names = {
      privilege: 'Привилегия',
      item: 'Предмет',
      experience: 'Впечатление',
      digital: 'Цифровое'
    }
    return names[category as keyof typeof names] || category
  }

  const formatPrice = (price: Reward['price']) => {
    const parts = []
    if (price.gold) parts.push(`🥇 ${price.gold}`)
    if (price.silver) parts.push(`🥈 ${price.silver}`)
    if (price.bronze) parts.push(`🥉 ${price.bronze}`)
    return parts.join(' ')
  }

  const activeRewards = rewards.filter(r => r.isActive)
  const inactiveRewards = rewards.filter(r => !r.isActive)

  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка магазина...</p>
          </div>
        </div>
      
    )
  }

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Магазин наград</h1>
            <p className="text-muted-foreground">
              Управление наградами, которые могут купить игроки
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить награду
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего наград</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rewards.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{activeRewards.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ограниченные</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rewards.filter(r => r.availability === 'limited').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Неактивные</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{inactiveRewards.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Активные награды */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Активные награды ({activeRewards.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRewards.map((reward) => (
              <Card key={reward.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{reward.icon}</div>
                      <div>
                        <CardTitle className="text-base">{reward.name}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(reward.category)}
                        >
                          {getCategoryName(reward.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Цена: {formatPrice(reward.price)}
                    </div>
                    {reward.availability === 'limited' && (
                      <Badge variant="outline" className="text-xs">
                        Осталось: {reward.stock || 0}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditReward(reward)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleRewardActive(reward.id)}
                      className="text-orange-400 border-orange-500/30"
                    >
                      Скрыть
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-red-400 border-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Неактивные награды */}
        {inactiveRewards.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Неактивные награды ({inactiveRewards.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveRewards.map((reward) => (
                <Card key={reward.id} className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl grayscale">{reward.icon}</div>
                        <div>
                          <CardTitle className="text-base">{reward.name}</CardTitle>
                          <Badge variant="outline" className="opacity-60">
                            {getCategoryName(reward.category)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Цена: {formatPrice(reward.price)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleRewardActive(reward.id)}
                        className="text-green-400 border-green-500/30"
                      >
                        Активировать
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteReward(reward.id)}
                        className="text-red-400 border-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Диалог создания/редактирования награды */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReward ? 'Редактировать награду' : 'Создать новую награду'}
              </DialogTitle>
              <DialogDescription>
                {editingReward 
                  ? 'Измените параметры существующей награды' 
                  : 'Добавьте новую награду в магазин'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                    placeholder="Название награды"
                  />
                </div>
                <div>
                  <Label>Иконка</Label>
                  <Input
                    value={newReward.icon}
                    onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                    placeholder="🎁"
                  />
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Описание награды..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Категория</Label>
                  <Select 
                    value={newReward.category}
                    onValueChange={(value) => setNewReward({ ...newReward, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="privilege">Привилегия</SelectItem>
                      <SelectItem value="item">Предмет</SelectItem>
                      <SelectItem value="experience">Впечатление</SelectItem>
                      <SelectItem value="digital">Цифровое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Доступность</Label>
                  <Select 
                    value={newReward.availability}
                    onValueChange={(value) => setNewReward({ ...newReward, availability: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Неограничено</SelectItem>
                      <SelectItem value="limited">Ограничено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newReward.availability === 'limited' && (
                <div>
                  <Label>Количество в наличии</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newReward.stock || 0}
                    onChange={(e) => setNewReward({ ...newReward, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div>
                <Label>Цена</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="🥇 Золото"
                      value={newReward.price.gold || ''}
                      onChange={(e) => setNewReward({ 
                        ...newReward, 
                        price: { ...newReward.price, gold: parseInt(e.target.value) || undefined }
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="🥈 Серебро"
                      value={newReward.price.silver || ''}
                      onChange={(e) => setNewReward({ 
                        ...newReward, 
                        price: { ...newReward.price, silver: parseInt(e.target.value) || undefined }
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="🥉 Бронза"
                      value={newReward.price.bronze || ''}
                      onChange={(e) => setNewReward({ 
                        ...newReward, 
                        price: { ...newReward.price, bronze: parseInt(e.target.value) || undefined }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={editingReward ? handleUpdateReward : handleCreateReward}>
                  {editingReward ? 'Сохранить изменения' : 'Создать награду'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
