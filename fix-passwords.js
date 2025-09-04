const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function hashExistingPasswords() {
  console.log('Хеширование существующих паролей...')
  
  // Получаем всех пользователей с нехешированными паролями
  const users = await prisma.user.findMany({
    where: {
      password: {
        not: null
      }
    }
  })

  console.log(`Найдено ${users.length} пользователей с паролями`)

  for (const user of users) {
    // Проверяем, не является ли пароль уже хешированным (bcrypt хеши начинаются с $2a$ или $2b$)
    if (user.password && !user.password.startsWith('$2')) {
      console.log(`Хеширование пароля для пользователя: ${user.email}`)
      
      const hashedPassword = await bcrypt.hash(user.password, 12)
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      console.log(`✅ Пароль обновлен для ${user.email}`)
    } else {
      console.log(`⏭️  Пароль уже хеширован для ${user.email}`)
    }
  }

  console.log('Хеширование завершено!')
}

hashExistingPasswords()
  .catch((e) => {
    console.error('Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
