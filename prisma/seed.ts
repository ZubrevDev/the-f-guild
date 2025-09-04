import { 
  PrismaClient, 
  QuestType, 
  QuestStatus, 
  UserRole, 
  EffectType, 
  RewardCategory, 
  AchievementCategory, 
  ItemCategory, 
  Rarity, 
  ActivityType 
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data (in correct order due to foreign key constraints)
  await prisma.activityLog.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.characterAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.effect.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.character.deleteMany()
  await prisma.guild.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
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
      id: 'alice-char-id',
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
      id: 'max-char-id',
      userId: player2.id,
      guildId: guild.id,
      name: 'Макс Мудрец',
      class: '🧙‍♂️ Волшебник',
      avatar: '🧙‍♂️',
      level: 4,
      experience: 180,
      maxExperience: 600,
      bronzeCoins: 8,
      silverCoins: 2,
      goldCoins: 1,
      streak: 3,
      completedQuests: 15,
      totalGoldEarned: 21,
    }
  })

  console.log('⚔️ Created test characters')

  // Create test quests
  const quests = [
    {
      title: 'Утренняя зарядка',
      description: 'Сделай 15 приседаний и 10 отжиманий',
      type: QuestType.DAILY,
      difficulty: 1,
      expReward: 50,
      bronzeReward: 3,
      silverReward: 0,
      goldReward: 0,
    },
    {
      title: 'Помой посуду после завтрака',
      description: 'Тщательно вымой всю посуду и поставь на места',
      type: QuestType.DAILY,
      difficulty: 1,
      expReward: 40,
      bronzeReward: 2,
      silverReward: 0,
      goldReward: 0,
    },
    {
      title: 'Выучи 10 английских слов',
      description: 'Изучи и запомни 10 новых английских слов с переводом',
      type: QuestType.EDUCATION,
      difficulty: 2,
      expReward: 150,
      bronzeReward: 5,
      silverReward: 2,
      goldReward: 0,
    },
    {
      title: 'Организуй книжную полку',
      description: 'Расставь все книги по категориям и протри полки',
      type: QuestType.SPECIAL,
      difficulty: 2,
      expReward: 100,
      bronzeReward: 0,
      silverReward: 3,
      goldReward: 1,
      characterId: aliceCharacter.id,
      status: 'IN_PROGRESS',
      progress: 1,
      maxProgress: 3,
    },
    {
      title: 'Помоги бабушке с покупками',
      description: 'Сходи в магазин и помоги донести сумки',
      type: QuestType.FAMILY,
      difficulty: 1,
      expReward: 80,
      bronzeReward: 0,
      silverReward: 1,
      goldReward: 1,
      characterId: aliceCharacter.id,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
    {
      title: 'Нарисуй картину',
      description: 'Создай красивую картину любой техникой',
      type: QuestType.CREATIVE,
      difficulty: 3,
      expReward: 200,
      bronzeReward: 0,
      silverReward: 5,
      goldReward: 2,
    },
    {
      title: 'Пробежка в парке',
      description: 'Пробеги 2 км в ближайшем парке',
      type: QuestType.PHYSICAL,
      difficulty: 2,
      expReward: 120,
      bronzeReward: 3,
      silverReward: 2,
      goldReward: 0,
    },
    {
      title: 'Прочитай главу книги',
      description: 'Прочитай одну главу из школьной литературы',
      type: QuestType.EDUCATION,
      difficulty: 1,
      expReward: 60,
      bronzeReward: 4,
      silverReward: 1,
      goldReward: 0,
      characterId: aliceCharacter.id,
      status: 'APPROVED',
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
    },
    {
      title: 'Семейная уборка',
      description: 'Вместе убрать всю квартиру за один день',
      type: QuestType.GROUP,
      difficulty: 2,
      expReward: 200,
      bronzeReward: 0,
      silverReward: 0,
      goldReward: 3,
      maxProgress: 2,
    }
  ]

  for (const questData of quests) {
    await prisma.quest.create({
      data: {
        guildId: guild.id,
        ...questData,
      }
    })
  }

  console.log('🎯 Created test quests')

  // Create test effects
  await prisma.effect.create({
    data: {
      characterId: aliceCharacter.id,
      name: 'Благословение Трудолюбия',
      type: EffectType.BLESSING,
      description: 'Получает +50% опыта за домашние дела',
      icon: '✨',
      duration: 3,
      maxDuration: 7,
      multipliers: { xpMultiplier: 1.5, questTypes: ['DAILY'] },
      reason: 'За 5 дней подряд выполнения ежедневных заданий',
    }
  })

  await prisma.effect.create({
    data: {
      characterId: aliceCharacter.id,
      name: 'Усталость',
      type: EffectType.DEBUFF,
      description: 'Поздно лег спать, -25% эффективности',
      icon: '😴',
      duration: 1,
      maxDuration: 2,
      multipliers: { xpMultiplier: 0.75 },
      reason: 'Лег спать после 22:00',
    }
  })

  await prisma.effect.create({
    data: {
      characterId: maxCharacter.id,
      name: 'Проклятие Беспорядка',
      type: EffectType.CURSE,
      description: 'Не убирал комнату 3 дня, все награды -30%',
      icon: '🌪️',
      duration: 2,
      maxDuration: 5,
      multipliers: { coinMultiplier: 0.7, xpMultiplier: 0.8 },
      restrictions: { shopBlocked: false },
      reason: 'Не убирал комнату 3 дня подряд',
    }
  })

  console.log('🎭 Created test effects')

  // Create test rewards
  const rewards = [
    {
      name: '30 минут телефона',
      description: 'Дополнительное время с любимыми играми',
      icon: '📱',
      category: RewardCategory.ENTERTAINMENT,
      rarity: Rarity.COMMON,
      silverCost: 3,
    },
    {
      name: '1 час игр',
      description: 'Время для любимых видеоигр',
      icon: '🎮',
      category: RewardCategory.ENTERTAINMENT,
      rarity: Rarity.COMMON,
      goldCost: 1,
    },
    {
      name: '1 евро',
      description: 'Реальные деньги на карманные расходы',
      icon: '💰',
      category: RewardCategory.MONEY,
      rarity: Rarity.RARE,
      goldCost: 1,
    },
    {
      name: '5 евро',
      description: 'Больше денег на личные покупки',
      icon: '💵',
      category: RewardCategory.MONEY,
      rarity: Rarity.RARE,
      goldCost: 4,
      stock: 1,
    },
    {
      name: 'Поход в кино',
      description: 'Семейный поход в кинотеатр',
      icon: '🍿',
      category: RewardCategory.ACTIVITIES,
      rarity: Rarity.EPIC,
      goldCost: 3,
      stock: 1,
    },
    {
      name: 'Набор для творчества',
      description: 'Новые материалы для рисования',
      icon: '🎨',
      category: RewardCategory.CREATIVE,
      rarity: Rarity.COMMON,
      silverCost: 5,
    },
    {
      name: 'Поздний отбой',
      description: 'Лечь спать на час позже',
      icon: '🛏️',
      category: RewardCategory.SPECIAL,
      rarity: Rarity.COMMON,
      bronzeCost: 10,
    },
    {
      name: 'Семейное приключение',
      description: 'Целый день посвящен твоим интересам',
      icon: '🗺️',
      category: RewardCategory.SPECIAL,
      rarity: Rarity.LEGENDARY,
      goldCost: 10,
      stock: 1,
    }
  ]

  for (const rewardData of rewards) {
    await prisma.reward.create({
      data: {
        guildId: guild.id,
        ...rewardData,
      }
    })
  }

  console.log('🛒 Created test rewards')

  // Create test achievements
  const achievements = [
    {
      name: 'Первые шаги',
      description: 'Выполнить первый квест',
      icon: '🎯',
      category: AchievementCategory.QUESTS,
      rarity: Rarity.COMMON,
      maxProgress: 1,
      expReward: 50,
      bronzeReward: 5,
    },
    {
      name: 'Мастер квестов',
      description: 'Выполнить 50 квестов',
      icon: '⚔️',
      category: AchievementCategory.QUESTS,
      rarity: Rarity.EPIC,
      maxProgress: 50,
      expReward: 500,
      goldReward: 3,
      titleReward: 'Мастер Квестов',
    },
    {
      name: 'Неделя силы',
      description: '7 дней подряд выполнять квесты',
      icon: '🔥',
      category: AchievementCategory.STREAKS,
      rarity: Rarity.COMMON,
      maxProgress: 7,
      expReward: 100,
      silverReward: 3,
    },
    {
      name: 'Опытный авантюрист',
      description: 'Достичь 5 уровня',
      icon: '⭐',
      category: AchievementCategory.PROGRESSION,
      rarity: Rarity.COMMON,
      maxProgress: 5,
      expReward: 200,
      silverReward: 5,
    },
    {
      name: 'Помощник семьи',
      description: 'Выполнить 20 семейных квестов',
      icon: '👨‍👩‍👧‍👦',
      category: AchievementCategory.SPECIAL,
      rarity: Rarity.RARE,
      maxProgress: 20,
      expReward: 200,
      silverReward: 8,
    },
    {
      name: 'Легенда гильдии',
      description: 'Выполнить 200 квестов и достичь 15 уровня',
      icon: '👑',
      category: AchievementCategory.LEGENDARY,
      rarity: Rarity.LEGENDARY,
      maxProgress: 1,
      expReward: 2000,
      goldReward: 10,
      titleReward: 'Легенда Гильдии',
    }
  ]

  for (const achievementData of achievements) {
    await prisma.achievement.create({
      data: {
        guildId: guild.id,
        ...achievementData,
      }
    })
  }

  console.log('🏆 Created test achievements')

  // Create character achievements (progress tracking)
  const allAchievements = await prisma.achievement.findMany({ where: { guildId: guild.id } })
  
  for (const achievement of allAchievements) {
    // Alice's achievements
    let progress = 0
    let unlocked = false
    let unlockedAt = null

    if (achievement.name === 'Первые шаги') {
      progress = 1
      unlocked = true
      unlockedAt = new Date('2024-01-15')
    } else if (achievement.name === 'Мастер квестов') {
      progress = 23
    } else if (achievement.name === 'Неделя силы') {
      progress = 5
    } else if (achievement.name === 'Опытный авантюрист') {
      progress = 7
      unlocked = true
      unlockedAt = new Date('2024-01-10')
    } else if (achievement.name === 'Помощник семьи') {
      progress = 12
    }

    await prisma.characterAchievement.create({
      data: {
        characterId: aliceCharacter.id,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt,
      }
    })

    // Max's achievements (lower progress)
    let maxProgress = Math.floor(progress * 0.6)
    let maxUnlocked = false
    let maxUnlockedAt = null

    if (achievement.name === 'Первые шаги') {
      maxProgress = 1
      maxUnlocked = true
      maxUnlockedAt = new Date('2024-01-20')
    } else if (achievement.name === 'Опытный авантюрист') {
      maxProgress = 4
    }

    await prisma.characterAchievement.create({
      data: {
        characterId: maxCharacter.id,
        achievementId: achievement.id,
        progress: maxProgress,
        unlocked: maxUnlocked,
        unlockedAt: maxUnlockedAt,
      }
    })
  }

  console.log('📊 Created character achievement progress')

  // Create test inventory items
  const inventoryItems = [
    {
      characterId: aliceCharacter.id,
      name: '30 минут телефона',
      description: 'Дополнительное время для игр',
      icon: '📱',
      category: ItemCategory.REWARD,
      rarity: Rarity.COMMON,
      quantity: 2,
      obtainedAt: new Date('2024-01-15'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Вечер кино',
      description: 'Право выбрать фильм на вечер',
      icon: '🎬',
      category: ItemCategory.REWARD,
      rarity: Rarity.RARE,
      quantity: 1,
      obtainedAt: new Date('2024-01-12'),
    },
    {
      characterId: aliceCharacter.id,
      name: '5 евро',
      description: 'Карманные деньги',
      icon: '💵',
      category: ItemCategory.REWARD,
      rarity: Rarity.RARE,
      quantity: 1,
      obtainedAt: new Date('2024-01-10'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Поздний отбой',
      description: 'Можно лечь спать на час позже',
      icon: '🛏️',
      category: ItemCategory.REWARD,
      rarity: Rarity.COMMON,
      quantity: 3,
      obtainedAt: new Date('2024-01-08'),
      expiresAt: new Date('2024-02-08'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Заряд энергии',
      description: '+50% опыта на следующий день',
      icon: '⚡',
      category: ItemCategory.CONSUMABLE,
      rarity: Rarity.EPIC,
      quantity: 1,
      obtainedAt: new Date('2024-01-14'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Пропуск задания',
      description: 'Пропустить одно задание без штрафа',
      icon: '🏃‍♂️',
      category: ItemCategory.CONSUMABLE,
      rarity: Rarity.RARE,
      quantity: 1,
      obtainedAt: new Date('2024-01-13'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Билет на семейное приключение',
      description: 'Право выбрать семейную активность на выходных',
      icon: '🎟️',
      category: ItemCategory.SPECIAL,
      rarity: Rarity.LEGENDARY,
      quantity: 1,
      obtainedAt: new Date('2024-01-05'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Выбор ужина',
      description: 'Решить, что семья будет есть на ужин',
      icon: '🍽️',
      category: ItemCategory.SPECIAL,
      rarity: Rarity.COMMON,
      quantity: 1,
      used: true,
      obtainedAt: new Date('2024-01-11'),
    },
    // Titles for Alice
    {
      characterId: aliceCharacter.id,
      name: 'Мастер Порядка',
      description: 'За поддержание чистоты в доме',
      icon: '🌟',
      category: ItemCategory.TITLE,
      rarity: Rarity.RARE,
      quantity: 1,
      usable: false,
      obtainedAt: new Date('2024-01-05'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Книжный Червь',
      description: 'За любовь к чтению',
      icon: '📚',
      category: ItemCategory.TITLE,
      rarity: Rarity.COMMON,
      quantity: 1,
      usable: false,
      obtainedAt: new Date('2024-01-08'),
    },
    {
      characterId: aliceCharacter.id,
      name: 'Спортсмен',
      description: 'За регулярные физические упражнения',
      icon: '💪',
      category: ItemCategory.TITLE,
      rarity: Rarity.COMMON,
      quantity: 1,
      usable: false,
      obtainedAt: new Date('2024-01-12'),
    }
  ]

  for (const itemData of inventoryItems) {
    await prisma.inventoryItem.create({
      data: itemData,
    })
  }

  console.log('🎒 Created test inventory items')

  // Create test purchases
  const phoneReward = await prisma.reward.findFirst({ where: { name: '30 минут телефона' } })
  if (phoneReward) {
    await prisma.purchase.create({
      data: {
        characterId: aliceCharacter.id,
        rewardId: phoneReward.id,
        quantity: 1,
        totalCost: { bronze: 0, silver: 3, gold: 0 },
        status: 'REDEEMED',
        purchasedAt: new Date('2024-01-14'),
        redeemedAt: new Date('2024-01-15'),
      }
    })
  }

  console.log('💰 Created test purchases')

  // Create test activity logs
  const activities = [
    {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: ActivityType.QUEST_COMPLETED,
      title: 'Квест завершен',
      description: 'Выполнил "Утренняя зарядка"',
      icon: '✅',
      metadata: { questId: 'quest-1', expGained: 50 },
      createdAt: new Date('2024-01-15T09:30:00Z'),
    },
    {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: ActivityType.ACHIEVEMENT_UNLOCKED,
      title: 'Новое достижение',
      description: 'Получен титул "Мастер Порядка"',
      icon: '🏆',
      metadata: { achievementId: 'achievement-1' },
      createdAt: new Date('2024-01-14T18:00:00Z'),
    },
    {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: ActivityType.LEVEL_UP,
      title: 'Повышение уровня',
      description: 'Достигнут 7 уровень!',
      icon: '🎉',
      metadata: { newLevel: 7 },
      createdAt: new Date('2024-01-13T14:20:00Z'),
    },
    {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: ActivityType.EFFECT_GAINED,
      title: 'Новый эффект',
      description: 'Получено "Благословение Трудолюбия"',
      icon: '✨',
      metadata: { effectId: 'effect-1' },
      createdAt: new Date('2024-01-12T16:45:00Z'),
    },
    {
      guildId: guild.id,
      characterId: aliceCharacter.id,
      type: ActivityType.PURCHASE_MADE,
      title: 'Покупка в магазине',
      description: 'Куплено "30 минут телефона"',
      icon: '🛒',
      metadata: { purchaseId: 'purchase-1' },
      createdAt: new Date('2024-01-14T10:00:00Z'),
    },
    {
      guildId: guild.id,
      characterId: maxCharacter.id,
      type: ActivityType.JOINED_GUILD,
      title: 'Присоединился к гильдии',
      description: 'Добро пожаловать в "Семья Драконоборцев"!',
      icon: '🏰',
      metadata: { guildId: guild.id },
      createdAt: new Date('2024-01-20T12:00:00Z'),
    }
  ]

  for (const activityData of activities) {
    await prisma.activityLog.create({
      data: activityData,
    })
  }

  console.log('📈 Created test activity logs')

  console.log('✅ Database seeding completed successfully!')
  
  // Print summary
  const summary = {
    users: await prisma.user.count(),
    guilds: await prisma.guild.count(),
    characters: await prisma.character.count(),
    quests: await prisma.quest.count(),
    effects: await prisma.effect.count(),
    rewards: await prisma.reward.count(),
    achievements: await prisma.achievement.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    activityLogs: await prisma.activityLog.count(),
  }

  console.log('\n📊 Database Summary:')
  console.log(`👥 Users: ${summary.users}`)
  console.log(`🏰 Guilds: ${summary.guilds}`)
  console.log(`⚔️ Characters: ${summary.characters}`)
  console.log(`🎯 Quests: ${summary.quests}`)
  console.log(`🎭 Effects: ${summary.effects}`)
  console.log(`🛒 Rewards: ${summary.rewards}`)
  console.log(`🏆 Achievements: ${summary.achievements}`)
  console.log(`🎒 Inventory Items: ${summary.inventoryItems}`)
  console.log(`📈 Activity Logs: ${summary.activityLogs}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
