const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setDefaultPassword() {
  console.log('Установка паролей для пользователей без пароля...')
  
  const usersWithoutPassword = await prisma.user.findMany({
    where: {
      OR: [
        { password: null },
        { password: '' }
      ]
    }
  })

  console.log(`Найдено ${usersWithoutPassword.length} пользователей без пароля`)

  for (const user of usersWithoutPassword) {
    const defaultPassword = '123' // Временный пароль
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Установлен пароль "123" для ${user.email}`)
  }

  console.log('Установка паролей завершена!')
}

setDefaultPassword()
  .catch((e) => {
    console.error('Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
