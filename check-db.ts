import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Проверяем состояние базы данных...\n')
  
  try {
    // Проверяем пользователей
    const users = await prisma.user.findMany({
      include: {
        guild: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })
    console.log(`👥 Пользователей: ${users.length}`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) в гильдии "${user.guild?.name || 'Нет гильдии'}"`)
    })

    // Проверяем персонажей
    const characters = await prisma.character.findMany({
      include: {
        user: { select: { name: true } },
        guild: { select: { name: true } },
        effects: true
      }
    })
    console.log(`\n🏃‍♀️ Персонажей: ${characters.length}`)
    characters.forEach(char => {
      console.log(`  - ${char.name} (${char.class}) - Уровень ${char.level}, ${char.effects.length} эффектов`)
    })

    // Проверяем квесты
    const quests = await prisma.quest.findMany({
      include: {
        character: { select: { name: true } }
      }
    })
    console.log(`\n🎯 Квестов: ${quests.length}`)
    quests.forEach(quest => {
      console.log(`  - "${quest.title}" [${quest.status}] ${quest.character ? `→ ${quest.character.name}` : '(доступен всем)'}`)
    })

    // Проверяем эффекты
    const effects = await prisma.effect.findMany({
      include: {
        character: { select: { name: true } }
      }
    })
    console.log(`\n🎭 Эффектов: ${effects.length}`)
    effects.forEach(effect => {
      console.log(`  - ${effect.icon} "${effect.name}" у ${effect.character.name} (${effect.duration}/${effect.maxDuration} дней)`)
    })

    // Проверяем активность
    const activities = await prisma.activityLog.findMany({
      include: {
        character: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`\n📈 Последняя активность (всего ${activities.length}):`)
    activities.forEach(activity => {
      const time = activity.createdAt.toLocaleString('ru-RU')
      console.log(`  - [${time}] ${activity.icon} ${activity.title} ${activity.character ? `(${activity.character.name})` : ''}`)
    })

    console.log('\n✅ База данных работает корректно!')

  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
