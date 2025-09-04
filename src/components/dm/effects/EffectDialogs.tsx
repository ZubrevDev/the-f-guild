import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Character {
  id: string
  name: string
  avatar: string
  level: number
}

interface NewEffect {
  characterId: string
  name: string
  description: string
  type: 'blessing' | 'curse' | 'buff' | 'debuff' | 'disease'
  icon: string
  duration: number
  multipliers: any
  restrictions: any
  bonuses: any
  reason: string
}

interface EffectTemplate {
  name: string
  icon: string
  description: string
  multipliers?: any
  restrictions?: any
  bonuses?: any
}

interface EffectDialogsProps {
  showCreateDialog: boolean
  setShowCreateDialog: (show: boolean) => void
  showApplyDialog: boolean
  setShowApplyDialog: (show: boolean) => void
  newEffect: NewEffect
  setNewEffect: (effect: NewEffect) => void
  selectedCharacter: string
  setSelectedCharacter: (char: string) => void
  characters: Character[]
  effectTemplates: Record<string, EffectTemplate[]>
  onCreateEffect: () => Promise<void>
  onQuickApply: (template: EffectTemplate, type: string) => Promise<void>
  applyTemplate: (template: EffectTemplate, type: string) => void
  getTypeName: (type: string) => string
}

export default function EffectDialogs({
  showCreateDialog,
  setShowCreateDialog,
  showApplyDialog,
  setShowApplyDialog,
  newEffect,
  setNewEffect,
  selectedCharacter,
  setSelectedCharacter,
  characters,
  effectTemplates,
  onCreateEffect,
  onQuickApply,
  applyTemplate,
  getTypeName
}: EffectDialogsProps) {
  
  const resetForm = () => {
    setNewEffect({
      characterId: '',
      name: '',
      description: '',
      type: 'blessing',
      icon: '✨',
      duration: 7,
      multipliers: {},
      restrictions: {},
      bonuses: {},
      reason: ''
    })
  }

  return (
    <>
      {/* ========== ДИАЛОГ СОЗДАНИЯ ЭФФЕКТА ========== */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать новый магический эффект</DialogTitle>
            <DialogDescription>
              Создайте уникальный эффект или используйте шаблон
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Выбор персонажа */}
            <div>
              <Label>Персонаж</Label>
              <Select
                value={newEffect.characterId}
                onValueChange={(value) => setNewEffect({ ...newEffect, characterId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите персонажа" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(characters) && characters.map(char => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.avatar} {char.name} (Уровень {char.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Основные поля */}
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
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тип эффекта</Label>
                <Select 
                  value={newEffect.type}
                  onValueChange={(value) => setNewEffect({ ...newEffect, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blessing">✨ Благословение</SelectItem>
                    <SelectItem value="curse">😈 Проклятие</SelectItem>
                    <SelectItem value="buff">⚡ Усиление</SelectItem>
                    <SelectItem value="debuff">💀 Ослабление</SelectItem>
                    <SelectItem value="disease">🤒 Болезнь</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Длительность (дни)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newEffect.duration}
                  onChange={(e) => setNewEffect({ ...newEffect, duration: parseInt(e.target.value) || 7 })}
                />
              </div>
            </div>

            <div>
              <Label>Причина применения</Label>
              <Input
                value={newEffect.reason}
                onChange={(e) => setNewEffect({ ...newEffect, reason: e.target.value })}
                placeholder="За что применяется эффект..."
              />
            </div>

            {/* Мультипликаторы */}
            <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-semibold">Мультипликаторы</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Множитель опыта</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newEffect.multipliers.xpMultiplier || ''}
                    onChange={(e) => setNewEffect({
                      ...newEffect,
                      multipliers: { ...newEffect.multipliers, xpMultiplier: parseFloat(e.target.value) || undefined }
                    })}
                    placeholder="1.5 = +50%"
                  />
                </div>
                <div>
                  <Label className="text-sm">Множитель монет</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newEffect.multipliers.coinMultiplier || ''}
                    onChange={(e) => setNewEffect({
                      ...newEffect,
                      multipliers: { ...newEffect.multipliers, coinMultiplier: parseFloat(e.target.value) || undefined }
                    })}
                    placeholder="0.7 = -30%"
                  />
                </div>
              </div>
            </div>

            {/* Бонусы */}
            <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-semibold">Бонусы</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Бонус золота</Label>
                  <Input
                    type="number"
                    value={newEffect.bonuses.bonusGold || ''}
                    onChange={(e) => setNewEffect({
                      ...newEffect,
                      bonuses: { ...newEffect.bonuses, bonusGold: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="+1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Доп. слот квеста</Label>
                  <Input
                    type="number"
                    value={newEffect.bonuses.extraQuestSlot || ''}
                    onChange={(e) => setNewEffect({
                      ...newEffect,
                      bonuses: { ...newEffect.bonuses, extraQuestSlot: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Шанс бонуса (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newEffect.bonuses.bonusChance || ''}
                    onChange={(e) => setNewEffect({
                      ...newEffect,
                      bonuses: { ...newEffect.bonuses, bonusChance: parseFloat(e.target.value) || undefined }
                    })}
                    placeholder="0.5 = 50%"
                  />
                </div>
              </div>
            </div>

            {/* Шаблоны */}
            <div className="space-y-2">
              <h4 className="font-semibold">Быстрые шаблоны</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(effectTemplates).map(([type, templates]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm text-muted-foreground capitalize">{getTypeName(type.slice(0, -1))}</p>
                    {templates.map((template, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template, type.slice(0, -1))}
                        className="w-full justify-start"
                      >
                        <span className="mr-2">{template.icon}</span>
                        <span className="truncate">{template.name}</span>
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}>
                Отмена
              </Button>
              <Button onClick={onCreateEffect}>
                <Plus className="w-4 h-4 mr-2" />
                Создать эффект
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== ДИАЛОГ БЫСТРОГО ПРИМЕНЕНИЯ ========== */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Быстрое применение эффекта</DialogTitle>
            <DialogDescription>
              Выберите персонажа и эффект из библиотеки шаблонов
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Персонаж</Label>
              <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите персонажа" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(characters) && characters.map(char => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.avatar} {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {Object.entries(effectTemplates).map(([type, templates]) => (
                <div key={type}>
                  <p className="text-sm font-semibold mb-2">{getTypeName(type.slice(0, -1))}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map((template, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={async () => {
                          if (!selectedCharacter) {
                            toast.error('Выберите персонажа')
                            return
                          }
                          await onQuickApply(template, type)
                        }}
                        className="justify-start"
                      >
                        <span className="text-xl mr-3">{template.icon}</span>
                        <div className="text-left">
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}