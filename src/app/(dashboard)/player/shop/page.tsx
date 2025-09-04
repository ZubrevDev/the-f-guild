'use client'

import { useState, useEffect } from 'react'
import { useUserSession } from '@/hooks/useUserSession'
import RewardShop from '@/components/player/RewardShop'
import { toast } from 'sonner'

interface PlayerCoins {
  gold: number
  silver: number
  bronze: number
}

interface Effect {
  id: string
  type: string
  effects: any
  restrictions?: any
}

export default function PlayerShopPage() {
  const [playerCoins, setPlayerCoins] = useState<PlayerCoins>({ gold: 0, silver: 0, bronze: 0 })
  const [activeEffects, setActiveEffects] = useState<Effect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { guild, character } = useUserSession()

  useEffect(() => {
    fetchData()
  }, [character?.id])

  const fetchData = async () => {
    if (!character?.id) return

    try {
      setError(null)
      
      // Fetch character data to get coins and effects
      const characterResponse = await fetch(`/api/character?characterId=${character.id}`)
      if (!characterResponse.ok) {
        throw new Error('Failed to fetch character data')
      }
      const characterData = await characterResponse.json()
      
      // Check API response structure
      console.log('Character API response:', characterData)
      
      // Extract data from API response
      const characterInfo = characterData.success && characterData.data ? characterData.data.character : characterData.character
      const effects = characterData.success && characterData.data ? characterData.data.activeEffects : characterData.activeEffects
      
      setPlayerCoins(characterInfo?.coins || { gold: 0, silver: 0, bronze: 0 })
      setActiveEffects(effects || [])

    } catch (error) {
      console.error('Error fetching player data:', error)
      setError('Ошибка загрузки данных игрока')
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

    const handlePurchase = async (itemId: string, cost: { type: 'gold' | 'silver' | 'bronze', amount: number }) => {
    if (!character?.id) return

    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character.id,
          itemId,
          cost
        })
      })

      if (!response.ok) {
        throw new Error('Failed to purchase item')
      }

      const result = await response.json()
      
      // Refresh data after successful purchase
      await fetchData()
      toast.success('Покупка успешна!')
      
    } catch (error) {
      console.error('Error purchasing item:', error)
      toast.error('Ошибка при покупке товара')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">🛒 Загружаем магазин...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  // Check if shop is blocked
  const shopBlocked = activeEffects.some(effect => effect.restrictions?.shopBlocked)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8">
        <RewardShop
          playerCoins={playerCoins}
          guildId={guild?.id || ""}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  )
}
