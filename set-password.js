const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setPasswordForUser() {
  console.log('Установка пароля для пользователя gladius-smol@gmail.ru...')
  
  const email = 'gladius-smol@gmail.ru'
  const plainPassword = '123456' // Простой пароль для входа
  
  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(plainPassword, 12)
  
  // Обновляем пароль пользователя
  const updatedUser = await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword }
  })
  
  console.log(`✅ Пароль установлен для пользователя: ${updatedUser.email}`)
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Пароль: ${plainPassword}`)
  console.log(`👤 Имя: ${updatedUser.name}`)
}

setPasswordForUser()
  .catch((e) => {
    console.error('Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
