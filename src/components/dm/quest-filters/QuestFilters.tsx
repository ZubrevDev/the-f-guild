'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'

interface Character {
  id: string
  name: string
  avatar: string
  level: number
}

interface QuestFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  selectedPlayer: string
  onPlayerChange: (value: string) => void
  characters: Character[]
  getQuestionCount: (status: string) => number
}

export default function QuestFilters({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  selectedPlayer,
  onPlayerChange,
  characters,
  getQuestionCount
}: QuestFiltersProps) {
  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search and Player Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Поиск квестов..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            {/* Player Filter */}
            <div className="w-full md:w-64">
              <Select value={selectedPlayer} onValueChange={onPlayerChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Фильтр по игроку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все игроки</SelectItem>
                  <SelectItem value="unassigned">Неназначенные</SelectItem>
                  {Array.isArray(characters) && characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name} (Ур. {character.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={filter} onValueChange={onFilterChange} className="w-full">
            <TabsList className="bg-slate-700 w-full justify-start">
              <TabsTrigger value="all" className="text-xs">
                Все ({getQuestionCount('all')})
              </TabsTrigger>
              <TabsTrigger value="available" className="text-xs">
                Доступные ({getQuestionCount('available')})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs">
                В процессе ({getQuestionCount('in_progress')})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                На проверке ({getQuestionCount('completed')})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs">
                Завершённые ({getQuestionCount('approved')})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
