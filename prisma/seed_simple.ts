import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...')

  // Clean existing data
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
      id: 'alice-char-id',
      user: { connect: { id: player1.id } },
      guild: { connect: { id: guild.id } },
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
      user: { connect: { id: player2.id } },
      guild: { connect: { id: guild.id } },
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
  const quests = [
    {
      title: 'Выучить таблицу умножения на 7',
      description: 'Повторить и выучить таблицу умножения на 7 без ошибок',
      type: 'DAILY',
      difficulty: 3,
      expReward: 50,
      bronzeReward: 5,
      silverReward: 2,
      goldReward: 0,
      status: 'ACTIVE',
      assignedTo: { connect: { id: aliceCharacter.id } },
      guild: { connect: { id: guild.id } },
      createdBy: { connect: { id: guildmaster.id } },
    },
    {
      title: 'Помыть посуду после обеда',
      description: 'Тщательно помыть всю посуду и убрать на место',
      type: 'DAILY',
      difficulty: 2,
      expReward: 30,
      bronzeReward: 3,
      silverReward: 1,
      goldReward: 0,
      status: 'ACTIVE',
      assignedTo: { connect: { id: maxCharacter.id } },
      guild: { connect: { id: guild.id } },
      createdBy: { connect: { id: guildmaster.id } },
    },
    {
      title: 'Семейная прогулка в парк',
      description: 'Всей семьей пойти погулять в парк минимум на 1 час',
      type: 'WEEKLY',
      difficulty: 2,
      expReward: 100,
      bronzeReward: 10,
      silverReward: 5,
      goldReward: 2,
      status: 'PENDING',
      guild: { connect: { id: guild.id } },
      createdBy: { connect: { id: guildmaster.id } },
    }
  ]

  for (const questData of quests) {
    await prisma.quest.create({ data: questData })
  }

  console.log('📝 Created test quests')

  // Log the results
  const stats = {
    users: await prisma.user.count(),
    guilds: await prisma.guild.count(),
    characters: await prisma.character.count(),
    quests: await prisma.quest.count(),
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
