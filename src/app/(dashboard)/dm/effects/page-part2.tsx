Duration })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Длительность обновлена')
        await loadData()
      }
    } catch (error) {
      console.error('Error updating duration:', error)
      toast.error('Ошибка обновления длительности')
    }
  }

  /**
   * Логирование активности
   */
  const logActivity = async (type: string, title: string, characterId?: string) => {
    if (!guild?.id) return
    
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: guild.id,
          characterId,
          type,
          title,
          description: `DM: ${title}`,
          icon: '🎭'
        })
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  /**
   * Получение цвета для типа эффекта
   */
  const getTypeColor = (type: string) => {
    const colors = {
      blessing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      curse: 'bg-red-500/20 text-red-300 border-red-500/30',
      buff: 'bg-green-500/20 text-green-300 border-green-500/30',
      debuff: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      disease: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300'
  }

  /**
   * Получение названия типа эффекта
   */
  const getTypeName = (type: string) => {
    const names = {
      blessing: 'Благословение',
      curse: 'Проклятие', 
      buff: 'Усиление',
      debuff: 'Ослабление',
      disease: 'Болезнь'
    }
    return names[type as keyof typeof names] || type
  }

  /**
   * Форматирование длительности
   */
  const formatDuration = (days: number) => {
    if (days === 1) return '1 день'
    if (days < 5) return `${days} дня`
    return `${days} дней`
  }

  /**
   * Получение иконки для типа эффекта
   */
  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      blessing: Crown,
      curse: Skull,
      buff: TrendingUp,
      debuff: TrendingDown,
      disease: Heart
    }
    const Icon = icons[type] || Activity
    return <Icon className="w-4 h-4" />
  }

  /**
   * Сброс формы
   */
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

  // ========== ФИЛЬТРАЦИЯ ЭФФЕКТОВ ==========
  const filteredEffects = effects.filter(effect => {
    const matchesType = filterType === 'all' || effect.type === filterType
    const matchesCharacter = filterCharacter === 'all' || effect.character?.id === filterCharacter
    return matchesType && matchesCharacter
  })

  // Группировка по персонажам
  const effectsByCharacter = filteredEffects.reduce((acc, effect) => {
    const charName = effect.character?.name || 'Без персонажа'
    if (!acc[charName]) acc[charName] = []
    acc[charName].push(effect)
    return acc
  }, {} as Record<string, Effect[]>)

  // ========== ЭФФЕКТЫ ==========
  useEffect(() => {
    loadData()
  }, [])

  // ========== РЕНДЕР ЗАГРУЗКИ ==========
  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Загрузка магических эффектов...</p>
          </div>
        </div>
      
    )
  }

  // ========== ОСНОВНОЙ РЕНДЕР ==========
  return (
    
      <div className="space-y-6">
        {/* ========== ШАПКА ========== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-purple-400" />
              Магические эффекты
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление благословениями, проклятиями и другими эффектами
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button onClick={() => setShowApplyDialog(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Быстрое применение
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать эффект
            </Button>
          </div>
        </div>

        {/* ========== СТАТИСТИКА ========== */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего эффектов</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{effects.length}</div>
              <p className="text-xs text-muted-foreground">
                {effects.filter(e => e.isActive).length} активных
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Благословения</CardTitle>
              <Crown className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {effects.filter(e => e.type === 'blessing').length}
              </div>
              <p className="text-xs text-muted-foreground">Положительные</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Проклятия</CardTitle>
              <Skull className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {effects.filter(e => e.type === 'curse').length}
              </div>
              <p className="text-xs text-muted-foreground">Отрицательные</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Временные</CardTitle>
              <Timer className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {effects.filter(e => e.type === 'buff' || e.type === 'debuff').length}
              </div>
              <p className="text-xs text-muted-foreground">Бафы и дебафы</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Персонажи</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {new Set(effects.map(e => e.character?.id).filter(Boolean)).size}
              </div>
              <p className="text-xs text-muted-foreground">С эффектами</p>
            </CardContent>
          </Card>
        </div>

        {/* ========== ФИЛЬТРЫ ========== */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="blessing">Благословения</SelectItem>
                  <SelectItem value="curse">Проклятия</SelectItem>
                  <SelectItem value="buff">Усиления</SelectItem>
                  <SelectItem value="debuff">Ослабления</SelectItem>
                  <SelectItem value="disease">Болезни</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCharacter} onValueChange={setFilterCharacter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все персонажи" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все персонажи</SelectItem>
                  {Array.isArray(characters) && characters.map(char => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.avatar} {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ========== СПИСОК ЭФФЕКТОВ ПО ПЕРСОНАЖАМ ========== */}
        {Object.entries(effectsByCharacter).map(([charName, charEffects]) => (
          <div key={charName}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {charName} ({charEffects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charEffects.map((effect) => (
                <Card key={effect.id} className={`relative ${!effect.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{effect.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {effect.name}
                            {!effect.isActive && <Badge variant="secondary">Истёк</Badge>}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={getTypeColor(effect.type)}
                            >
                              {getTypeIcon(effect.type)}
                              <span className="ml-1">{getTypeName(effect.type)}</span>
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
                    
                    {/* Отображение эффектов */}
                    <div className="space-y-2 text-xs">
                      {effect.multipliers?.xpMultiplier && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Опыт: x{effect.multipliers.xpMultiplier}</span>
                        </div>
                      )}
                      {effect.multipliers?.coinMultiplier && (
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>Монеты: x{effect.multipliers.coinMultiplier}</span>
                        </div>
                      )}
                      {effect.bonuses?.bonusGold && (
                        <div className="flex items-center gap-1">
                          <span>🏆 Бонус золота: {effect.bonuses.bonusGold > 0 ? '+' : ''}{effect.bonuses.bonusGold}</span>
                        </div>
                      )}
                      {effect.restrictions?.shopBlocked && (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Магазин заблокирован</span>
                        </div>
                      )}
                    </div>

                    {effect.reason && (
                      <p className="text-xs text-muted-foreground italic">
                        Причина: {effect.reason}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateDuration(effect.id, effect.duration + 1)}
                      >
                        +1 день
                      </Button>
                      {effect.duration > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateDuration(effect.id, effect.duration - 1)}
                        >
                          -1 день
                        </Button>
                      )}
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
        ))}

        {/* Конец основной части, продолжение в следующем файле */}
      </div>
    
  )
}