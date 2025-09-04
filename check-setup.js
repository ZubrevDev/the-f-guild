#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка настройки проекта The F-Guild...\n');

// Функция для выполнения команд
function runCommand(command, description) {
  try {
    console.log(`⏳ ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - успешно`);
    return output;
  } catch (error) {
    console.log(`❌ ${description} - ошибка:`);
    console.log(error.message);
    return null;
  }
}

// Функция для проверки файлов
function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${description} - найден`);
      return true;
    } else {
      console.log(`❌ ${description} - не найден`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - ошибка проверки`);
    return false;
  }
}

async function main() {
  console.log('📋 Проверка основных файлов:');
  
  // Проверяем ключевые файлы
  const files = [
    ['package.json', 'Package.json'],
    ['prisma/schema.prisma', 'Prisma схема'],
    ['prisma/seed.ts', 'Seed файл'],
    ['src/lib/prisma.ts', 'Prisma клиент']
  ];

  let filesOk = true;
  files.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      filesOk = false;
    }
  });

  // Проверяем .env файл
  if (!checkFile('.env', '.env файл')) {
    console.log('⏳ Создаем базовый .env файл...');
    try {
      fs.writeFileSync('.env', 'DATABASE_URL="file:./dev.db"\nNEXTAUTH_SECRET="your-secret-key"\nNEXTAUTH_URL="http://localhost:3000"\n');
      console.log('✅ .env файл создан');
    } catch (error) {
      console.log('❌ Ошибка создания .env файла');
      filesOk = false;
    }
  }

  if (!filesOk) {
    console.log('\n❌ Некоторые файлы отсутствуют. Убедитесь, что проект настроен правильно.');
    return;
  }

  console.log('\n📦 Проверка зависимостей:');
  
  // Проверяем установку зависимостей
  if (!fs.existsSync('node_modules')) {
    console.log('⏳ node_modules не найден, устанавливаем зависимости...');
    runCommand('npm install', 'Установка зависимостей');
  } else {
    console.log('✅ node_modules найден');
  }

  console.log('\n🗄️ Проверка базы данных:');

  // Генерируем Prisma клиент
  runCommand('npx prisma generate', 'Генерация Prisma клиента');

  // Проверяем, существует ли база данных
  if (!fs.existsSync('prisma/dev.db')) {
    console.log('⏳ База данных не найдена, создаем...');
    
    // Пытаемся создать миграцию
    const migrateResult = runCommand('npx prisma migrate dev --name init', 'Создание базы данных');
    
    if (migrateResult !== null) {
      console.log('⏳ Заполняем базу тестовыми данными...');
      runCommand('npx tsx prisma/seed.ts', 'Заполнение тестовыми данными');
    } else {
      console.log('⚠️  Ошибка создания базы данных. Попробуйте db:push:');
      runCommand('npx prisma db push', 'Применение схемы к базе данных');
      runCommand('npx tsx prisma/seed.ts', 'Заполнение тестовыми данными');
    }
  } else {
    console.log('✅ База данных найдена');
    
    // Проверяем, есть ли данные
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const userCount = await prisma.user.count();
      const questCount = await prisma.quest.count();
      
      if (userCount === 0 || questCount === 0) {
        console.log('⏳ База данных пуста, заполняем тестовыми данными...');
        runCommand('npx tsx prisma/seed.ts', 'Заполнение тестовыми данными');
      } else {
        console.log(`✅ База данных содержит данные (${userCount} пользователей, ${questCount} квестов)`);
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log('⚠️  Не удалось проверить содержимое базы данных, но это не критично');
      console.log('💡 Попробуйте запустить: npm run db:seed');
    }
  }

  console.log('\n🎯 Проверка завершена!');
  
  console.log('\n📖 Следующие шаги:');
  console.log('1. Запустите: npm run dev');
  console.log('2. Откройте: http://localhost:3000/player');
  console.log('3. Протестируйте функции игрока');
  console.log('4. При необходимости: npm run db:studio (для просмотра БД)');
  
  console.log('\n🧪 Тестовые персонажи:');
  console.log('• Алиса (alice-char-id) - Уровень 7, активные эффекты');
  console.log('• Макс (max-char-id) - Уровень 4, проклятие беспорядка');

  console.log('\n🛠️  Полезные команды:');
  console.log('• npm run db:reset    - сброс и пересоздание БД');
  console.log('• npm run db:seed     - заполнение тестовыми данными');
  console.log('• npm run db:studio   - визуальный редактор БД');
}

main().catch(console.error);
