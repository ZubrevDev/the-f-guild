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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Sparkles, 
  Plus,
  Edit,
  Trash2,
  Star,
  Shield,
  Zap,
  Heart,
  Crown,
  Skull,
  Timer
} from 'lucide-react'

interface Effect {
  id: string
  name: string
  description: string
  type: 'blessing' | 'curse' | 'buff' | 'debuff'
  icon: string
  duration: number // в минутах
  isActive: boolean
  createdAt: string
}

export default function EffectsManagement() {
  const [effects, setEffects] = useState<Effect[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingEffect, setEditingEffect] = useState<Effect | null>(null)
  const { guild, loading: sessionLoading } = useUserSession()
  const [newEffect, setNewEffect] = useState<Omit<Effect, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    type: 'blessing',
    icon: '✨',
    duration: 60,
    isActive: true
  })

  useEffect(() => {
    const fetchEffects = async () => {
      // Ждем загрузки данных сессии и наличия гильдии
      if (sessionLoading || !guild?.id) return
      
      setLoading(true)
      try {
        console.log('Effects: Loading effects data...')
        
        const response = await fetch(`/api/effects?guildId=${guild.id}`)
        const result = await response.json()
        
        console.log('Effects: API response:', result)
        
        if (result.success && result.data && result.data.effects) {
          // Преобразуем данные эффектов
          const effectsData: Effect[] = result.data.effects.map((effect: {
            id: string
            name: string
            description: string
            type: string
            icon: string
            duration: number
            createdAt: string
            character?: { id: string; name: string }
          }) => ({
            id: effect.id,
            name: effect.name,
            description: effect.description,
            type: effect.type as 'blessing' | 'curse' | 'buff' | 'debuff',
            icon: effect.icon,
            duration: effect.duration,
            isActive: effect.duration > 0,
            createdAt: effect.createdAt,
            character: effect.character
          }))
          
          console.log('Effects: Mapped effects:', effectsData)
          setEffects(effectsData)
        } else {
          console.log('Effects: No effects found from API')
          setEffects([])
        }
      } catch (error) {
        console.error('Effects: Error loading effects:', error)
        setEffects([])
      } finally {
        setLoading(false)
      }
    }

    fetchEffects()
  }, [guild?.id, sessionLoading])

  const handleCreateEffect = () => {
    const effect: Effect = {
      ...newEffect,
      id: `effect-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setEffects([effect, ...effects])
    setShowCreateDialog(false)
    resetForm()
  }

  const handleEditEffect = (effect: Effect) => {
    setEditingEffect(effect)
    setNewEffect({
      name: effect.name,
      description: effect.description,
      type: effect.type,
      icon: effect.icon,
      duration: effect.duration,
      isActive: effect.isActive
    })
    setShowCreateDialog(true)
  }

  const handleUpdateEffect = () => {
    if (!editingEffect) return
    
    const updatedEffect: Effect = {
      ...editingEffect,
      ...newEffect
    }
    
    setEffects(effects.map(e => e.id === editingEffect.id ? updatedEffect : e))
    setShowCreateDialog(false)
    setEditingEffect(null)
    resetForm()
  }

  const handleDeleteEffect = (effectId: string) => {
    setEffects(effects.filter(e => e.id !== effectId))
  }

  const toggleEffectActive = (effectId: string) => {
    setEffects(effects.map(e => 
      e.id === effectId ? { ...e, isActive: !e.isActive } : e
    ))
  }

  const resetForm = () => {
    setNewEffect({
      name: '',
      description: '',
      type: 'blessing',
      icon: '✨',
      duration: 60,
      isActive: true
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      blessing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      curse: 'bg-red-500/20 text-red-300 border-red-500/30',
      buff: 'bg-green-500/20 text-green-300 border-green-500/30',
      debuff: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300'
  }

  const getTypeName = (type: string) => {
    const names = {
      blessing: 'Благословение',
      curse: 'Проклятие', 
      buff: 'Усиление',
      debuff: 'Ослабление'
    }
    return names[type as keyof typeof names] || type
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`
  }

  const activeEffects = effects.filter(e => e.isActive)
  const inactiveEffects = effects.filter(e => !e.isActive)

  if (sessionLoading || loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка эффектов...</p>
          </div>
        </div>
      
    )
  }

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Магические эффекты</h1>
            <p className="text-muted-foreground">
              Управление эффектами для мотивации и наказания игроков
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Создать эффект
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего эффектов</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{effects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{activeEffects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Благословения</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {effects.filter(e => e.type === 'blessing').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Проклятия</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {effects.filter(e => e.type === 'curse').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Активные эффекты */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Активные эффекты ({activeEffects.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEffects.map((effect) => (
              <Card key={effect.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{effect.icon}</div>
                      <div>
                        <CardTitle className="text-base">{effect.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={getTypeColor(effect.type)}
                          >
                            {getTypeName(effect.type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Timer className="w-3 h-3 mr-1" />
                            {formatDuration(effect.duration)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{effect.description}</p>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditEffect(effect)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleEffectActive(effect.id)}
                      className="text-orange-400 border-orange-500/30"
                    >
                      Скрыть
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteEffect(effect.id)}
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

        {/* Неактивные эффекты */}
        {inactiveEffects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Неактивные эффекты ({inactiveEffects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveEffects.map((effect) => (
                <Card key={effect.id} className="opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl grayscale">{effect.icon}</div>
                        <div>
                          <CardTitle className="text-base">{effect.name}</CardTitle>
                          <Badge variant="outline" className="opacity-60 mt-1">
                            {getTypeName(effect.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{effect.description}</p>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleEffectActive(effect.id)}
                        className="text-green-400 border-green-500/30"
                      >
                        Активировать
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteEffect(effect.id)}
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

        {/* Диалог создания/редактирования эффекта */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEffect ? 'Редактировать эффект' : 'Создать новый эффект'}
              </DialogTitle>
              <DialogDescription>
                {editingEffect 
                  ? 'Измените параметры существующего эффекта' 
                  : 'Создайте новый магический эффект для игроков'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={newEffect.name}
                    onChange={(e) => setNewEffect({ ...newEffect, name: e.target.value })}
                    placeholder="Название эффекта"
                  />
                </div>
                <div>
                  <Label>Иконка</Label>
                  <Input
                    value={newEffect.icon}
                    onChange={(e) => setNewEffect({ ...newEffect, icon: e.target.value })}
                    placeholder="✨"
                  />
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={newEffect.description}
                  onChange={(e) => setNewEffect({ ...newEffect, description: e.target.value })}
                  placeholder="Описание эффекта и его влияние на игрока..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Тип эффекта</Label>
                  <Select 
                    value={newEffect.type}
                    onValueChange={(value) => setNewEffect({ ...newEffect, type: value as Effect['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blessing">Благословение</SelectItem>
                      <SelectItem value="curse">Проклятие</SelectItem>
                      <SelectItem value="buff">Усиление</SelectItem>
                      <SelectItem value="debuff">Ослабление</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Длительность (минуты)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newEffect.duration}
                    onChange={(e) => setNewEffect({ ...newEffect, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false)
                  setEditingEffect(null)
                  resetForm()
                }}>
                  Отмена
                </Button>
                <Button onClick={editingEffect ? handleUpdateEffect : handleCreateEffect}>
                  {editingEffect ? 'Сохранить изменения' : 'Создать эффект'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
