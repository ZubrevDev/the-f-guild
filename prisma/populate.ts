import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Добавляем данные к существующим пользователям...')

  // Проверим, какие пользователи есть
  const users = await prisma.user.findMany()
  console.log('👥 Найденные пользователи:', users.map(u => u.name))

  if (users.length === 0) {
    console.log('❌ Пользователи не найдены!')
    return
  }

  // Найдем гилдмастера или создадим гильдию для первого пользователя
  let guildmaster = users.find(u => u.role === 'GUILDMASTER') || users[0]
  
  // Создаем гильдию, если её нет
  let guild = await prisma.guild.findFirst()
  if (!guild) {
    guild = await prisma.guild.create({
      data: {
        name: 'Семья Драконоборцев',
        description: 'Веселая семейная гильдия для совместных приключений!',
        code: 'DRAGON' + Math.floor(Math.random() * 100),
        memberCount: users.length,
        activeQuests: 0,
        completedToday: 0,
        ownerId: guildmaster.id,
      }
    })
    console.log('🏰 Создана гильдия:', guild.name)
  }

  // Обновляем всех пользователей - добавляем в гильдию
  await prisma.user.updateMany({
    data: { guildId: guild.id }
  })

  // Создаем персонажей для каждого пользователя
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    
    // Проверим, есть ли уже персонаж
    const existingChar = await prisma.character.findFirst({
      where: { userId: user.id }
    })

    if (!existingChar) {
      const characterNames = ['Алиса Храбрая', 'Макс Мудрец', 'Анна Искатель']
      const characterClasses = ['🛡️ Паладин', '🧙‍♂️ Волшебник', '🏹 Следопыт']
      const avatars = ['👸', '🧙‍♂️', '🏹']

      await prisma.character.create({
        data: {
          userId: user.id,
          guildId: guild.id,
          name: characterNames[i] || `Герой ${i + 1}`,
          class: characterClasses[i] || '⚔️ Воин',
          avatar: avatars[i] || '⚔️',
          level: Math.floor(Math.random() * 5) + 1,
          experience: Math.floor(Math.random() * 500) + 100,
          maxExperience: 1000,
          bronzeCoins: Math.floor(Math.random() * 20) + 5,
          silverCoins: Math.floor(Math.random() * 10) + 2,
          goldCoins: Math.floor(Math.random() * 5) + 1,
          streak: Math.floor(Math.random() * 10),
          completedQuests: Math.floor(Math.random() * 30) + 10,
          totalGoldEarned: Math.floor(Math.random() * 100) + 20,
          activeTitle: ['Новичок', 'Старатель', 'Мастер'][Math.floor(Math.random() * 3)],
        }
      })
      console.log(`🏃‍♀️ Создан персонаж для ${user.name}`)
    }
  }

  // Получаем всех персонажей
  const characters = await prisma.character.findMany()

  // Создаем квесты
  const questTemplates = [
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
    },
    {
      title: 'Прочитать 10 страниц книги',
      description: 'Выбрать интересную книгу и прочитать минимум 10 страниц',
      type: 'DAILY',
      difficulty: 3,
      expReward: 40,
      bronzeReward: 4,
      silverReward: 2,
      goldReward: 0,
      status: 'ACTIVE',
    },
    {
      title: 'Убрать свою комнату',
      description: 'Навести полный порядок: пропылесосить, протереть пыль, сложить вещи',
      type: 'WEEKLY',
      difficulty: 4,
      expReward: 80,
      bronzeReward: 8,
      silverReward: 4,
      goldReward: 1,
      status: 'ACTIVE',
    },
  ]

  // Создаем квесты для разных персонажей
  for (let i = 0; i < questTemplates.length; i++) {
    const template = questTemplates[i]
    const assignedCharacter = characters[i % characters.length] // Распределяем квесты между персонажами
    
    await prisma.quest.create({
      data: {
        ...template,
        assignedToId: template.status === 'PENDING' ? null : assignedCharacter.id,
        guildId: guild.id,
        createdById: guildmaster.id,
      }
    })
  }

  console.log(`📝 Создано ${questTemplates.length} квестов`)

  // Создаем несколько наград
  const rewards = [
    {
      name: '30 минут телефона',
      description: 'Дополнительные 30 минут экранного времени',
      cost: 50,
      category: 'ENTERTAINMENT',
      isActive: true,
      guildId: guild.id,
    },
    {
      name: 'Выбор фильма на вечер',
      description: 'Право выбрать фильм для семейного просмотра',
      cost: 75,
      category: 'ENTERTAINMENT', 
      isActive: true,
      guildId: guild.id,
    },
    {
      name: '100 рублей на карманные расходы',
      description: 'Денежная награда за хорошую работу',
      cost: 200,
      category: 'MONEY',
      isActive: true,
      guildId: guild.id,
    },
  ]

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward })
  }

  console.log(`🎁 Создано ${rewards.length} наград`)

  // Финальная статистика
  const stats = {
    users: await prisma.user.count(),
    guilds: await prisma.guild.count(),
    characters: await prisma.character.count(),
    quests: await prisma.quest.count(),
    rewards: await prisma.reward.count(),
  }

  console.log('✅ База данных успешно заполнена!')
  console.log('📊 Статистика:', stats)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка заполнения:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Подключение к БД закрыто')
  })
