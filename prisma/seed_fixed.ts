import { PrismaClient, QuestStatus, QuestType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...')

  // Clean existing data
  await prisma.activityLog.deleteMany()
  await prisma.effect.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.character.deleteMany()
  await prisma.guild.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create test users
  const guildmaster = await prisma.user.create({
    data: {
      id: 'gm-user-id',
      name: 'Гилд-мастер',
      email: 'guildmaster@example.com',
      role: 'GUILDMASTER',
    }
  })

  const player1 = await prisma.user.create({
    data: {
      id: 'player1-user-id', 
      name: 'Алиса',
      email: 'alice@example.com',
      role: 'PLAYER',
    }
  })

  const player2 = await prisma.user.create({
    data: {
      id: 'player2-user-id',
      name: 'Макс', 
      email: 'max@example.com',
      role: 'PLAYER',
    }
  })

  console.log('👥 Created test users')

  // Create test guild
  const guild = await prisma.guild.create({
    data: {
      id: 'test-guild-id',
      name: 'Семья Драконоборцев',
      description: 'Веселая семейная гильдия для совместных приключений!',
      code: 'DRAGON',
      memberCount: 3,
      activeQuests: 8,
      completedToday: 3,
      ownerId: guildmaster.id,
    }
  })

  // Update users with guild
  await prisma.user.updateMany({
    where: { id: { in: [guildmaster.id, player1.id, player2.id] } },
    data: { guildId: guild.id }
  })

  console.log('🏰 Created test guild')

  // Create characters
  const aliceCharacter = await prisma.character.create({
    data: {
      id: 'char-alice',
      userId: player1.id,
      guildId: guild.id,
      name: 'Алиса Храбрая',
      class: '🛡️ Паладин Порядка',
      avatar: '👸',
      level: 7,
      experience: 650,
      maxExperience: 1000,
      bronzeCoins: 12,
      silverCoins: 5,
      goldCoins: 2,
      streak: 5,
      completedQuests: 23,
      totalGoldEarned: 47,
      activeTitle: 'Мастер Порядка',
    }
  })

  const maxCharacter = await prisma.character.create({
    data: {
      id: 'char-max',
      userId: player2.id,
      guildId: guild.id,
      name: 'Макс Мудрец',
      class: '🧙‍♂️ Волшебник Знаний',
      avatar: '🧙‍♂️',
      level: 4,
      experience: 280,
      maxExperience: 500,
      bronzeCoins: 8,
      silverCoins: 3,
      goldCoins: 1,
      streak: 2,
      completedQuests: 12,
      totalGoldEarned: 23,
      activeTitle: 'Ученик Магии',
    }
  })

  console.log('🏃‍♀️ Created characters')

  // Create some test quests
  const quest1 = await prisma.quest.create({
    data: {
      title: 'Выучить таблицу умножения на 7',
      description: 'Повторить и выучить таблицу умножения на 7 без ошибок',
      type: QuestType.EDUCATION,
      status: QuestStatus.IN_PROGRESS,
      difficulty: 3,
      expReward: 50,
      bronzeReward: 5,
      silverReward: 2,
      goldReward: 0,
      guildId: guild.id,
      characterId: aliceCharacter.id,
    }
  })

  const quest2 = await prisma.quest.create({
    data: {
      title: 'Помыть посуду после обеда',
      description: 'Тщательно помыть всю посуду и убрать на место',
      type: QuestType.DAILY,
      status: QuestStatus.IN_PROGRESS,
      difficulty: 2,
      expReward: 30,
      bronzeReward: 3,
      silverReward: 1,
      goldReward: 0,
      guildId: guild.id,
      characterId: maxCharacter.id,
    }
  })

  const quest3 = await prisma.quest.create({
    data: {
      title: 'Семейная прогулка в парк',
      description: 'Всей семьей пойти погулять в парк минимум на 1 час',
      type: QuestType.FAMILY,
      status: QuestStatus.AVAILABLE,
      difficulty: 2,
      expReward: 100,
      bronzeReward: 10,
      silverReward: 5,
      goldReward: 2,
      guildId: guild.id,
    }
  })

  const quest4 = await prisma.quest.create({
    data: {
      title: 'Убрать комнату',
      description: 'Привести свою комнату в порядок: убрать игрушки, разложить вещи по местам',
      type: QuestType.DAILY,
      status: QuestStatus.AVAILABLE,
      difficulty: 1,
      expReward: 40,
      bronzeReward: 4,
      silverReward: 1,
      goldReward: 0,
      guildId: guild.id,
    }
  })

  console.log('📝 Created test quests')

  // Create some effects for Alice
  await prisma.effect.create({
    data: {
      characterId: aliceCharacter.id,
      name: 'Благословение Трудолюбия',
      type: 'BLESSING',
      description: 'Получает +50% опыта за домашние дела',
      icon: '✨',
      duration: 3,
      maxDuration: 7,
      multipliers: { xpMultiplier: 1.5, questTypes: ["DAILY"] },
      reason: 'За отличную дисциплину в выполнении ежедневных заданий'
    }
  })

  await prisma.effect.create({
    data: {
      characterId: aliceCharacter.id,
      name: 'Усталость',
      type: 'DEBUFF',
      description: 'Поздно лег спать, -25% к эффективности',
      icon: '😴',
      duration: 1,
      maxDuration: 2,
      multipliers: { xpMultiplier: 0.75 },
      reason: 'Лег спать после 22:00'
    }
  })

  // Create effect for Max
  await prisma.effect.create({
    data: {
      characterId: maxCharacter.id,
      name: 'Проклятие Беспорядка',
      type: 'CURSE',
      description: 'Не убирал комнату 3 дня, все награды -30%',
      icon: '🌪️',
      duration: 2,
      maxDuration: 5,
      multipliers: { coinMultiplier: 0.7, xpMultiplier: 0.8 },
      restrictions: { shopBlocked: true },
      reason: 'Игнорировал просьбы убрать комнату'
    }
  })

  console.log('🎭 Created test effects')

  // Create some activity logs
  await prisma.activityLog.create({
    data: {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: 'QUEST_COMPLETED',
      title: 'Квест выполнен!',
      description: 'Выполнила "Полить цветы на подоконнике"',
      icon: '✅',
      metadata: { questId: quest1.id, xpGained: 30, coinsEarned: { bronze: 3 } }
    }
  })

  await prisma.activityLog.create({
    data: {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: 'EFFECT_GAINED',
      title: 'Получено благословение!',
      description: 'Благословение Трудолюбия за отличную работу',
      icon: '✨',
      metadata: { effectName: 'Благословение Трудолюбия', duration: 7 }
    }
  })

  await prisma.activityLog.create({
    data: {
      guildId: guild.id,
      characterId: maxCharacter.id,
      type: 'EFFECT_GAINED',
      title: 'Получено проклятие',
      description: 'Проклятие Беспорядка за невыполнение обязанностей',
      icon: '🌪️',
      metadata: { effectName: 'Проклятие Беспорядка', duration: 5 }
    }
  })

  console.log('📈 Created activity logs')

  // Log the results
  const stats = {
    users: await prisma.user.count(),
    guilds: await prisma.guild.count(),
    characters: await prisma.character.count(),
    quests: await prisma.quest.count(),
    effects: await prisma.effect.count(),
    activities: await prisma.activityLog.count(),
  }

  console.log('✅ Database seeded successfully!')
  console.log('📊 Final stats:', stats)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })
