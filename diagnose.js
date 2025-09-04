#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🩺 Диагностика и автоматическое исправление проблем...\n');

// Цвета для вывода
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(colors[color] + message + colors.reset);
}

function checkFile(path, description) {
  if (fs.existsSync(path)) {
    log('green', `✅ ${description}`);
    return true;
  } else {
    log('red', `❌ ${description}`);
    return false;
  }
}

function runCommand(command, description, optional = false) {
  try {
    log('blue', `🔧 ${description}...`);
    execSync(command, { stdio: optional ? 'pipe' : 'inherit' });
    log('green', `✅ ${description} выполнено`);
    return true;
  } catch (error) {
    log('red', `❌ ${description} не удалось`);
    if (!optional) {
      console.error(error.message);
    }
    return false;
  }
}

function main() {
  log('cyan', '='.repeat(50));
  log('cyan', '🚀 ДИАГНОСТИКА THE F GUILD');
  log('cyan', '='.repeat(50));

  // 1. Проверка файлов
  log('yellow', '\n1. Проверка ключевых файлов:');
  
  const files = [
    ['prisma/schema.prisma', 'Схема базы данных'],
    ['prisma/seed_fixed.ts', 'Исправленный seed файл'],
    ['src/app/api/character/route.ts', 'API endpoint для персонажей'],
    ['src/app/api/quests/route.ts', 'API endpoint для квестов'],
    ['init-db.js', 'Скрипт инициализации БД'],
    ['check-db.ts', 'Скрипт проверки БД']
  ];

  let filesOk = true;
  files.forEach(([path, desc]) => {
    if (!checkFile(path, desc)) {
      filesOk = false;
    }
  });

  // 2. Проверка базы данных
  log('yellow', '\n2. Проверка базы данных:');
  
  if (!checkFile('prisma/dev.db', 'Файл базы данных')) {
    log('yellow', '⚠️  База данных не найдена, создаем...');
    
    // Удаляем старую БД если есть
    try {
      fs.unlinkSync('prisma/dev.db');
    } catch (e) {
      // Игнорируем ошибку если файла нет
    }

    // Применяем миграции
    if (!runCommand('npx prisma migrate dev --name init', 'Применение миграций')) {
      process.exit(1);
    }

    // Запускаем seed
    if (!runCommand('npx tsx prisma/seed_fixed.ts', 'Заполнение тестовыми данными')) {
      process.exit(1);
    }

    // Генерируем клиент
    runCommand('npx prisma generate', 'Генерация Prisma Client');
  }

  // 3. Проверка содержимого БД
  log('yellow', '\n3. Проверка содержимого базы данных:');
  
  if (runCommand('npx tsx check-db.ts', 'Проверка данных в БД', true)) {
    log('green', '✅ База данных содержит корректные данные');
  } else {
    log('yellow', '⚠️  Проблемы с данными, пересоздаем БД...');
    
    // Удаляем и пересоздаем
    try {
      fs.unlinkSync('prisma/dev.db');
    } catch (e) {}
    
    runCommand('npx prisma migrate dev --name reinit', 'Пересоздание БД');
    runCommand('npx tsx prisma/seed_fixed.ts', 'Повторное заполнение данных');
  }

  // 4. Проверка зависимостей
  log('yellow', '\n4. Проверка зависимостей:');
  
  if (!checkFile('node_modules', 'Node modules')) {
    log('yellow', '⚠️  Зависимости не установлены, устанавливаем...');
    runCommand('npm install', 'Установка зависимостей');
  } else {
    log('green', '✅ Зависимости установлены');
  }

  // 5. Генерация Prisma Client
  log('yellow', '\n5. Генерация Prisma Client:');
  runCommand('npx prisma generate', 'Генерация Prisma Client', true);

  // 6. Итоговый статус
  log('yellow', '\n6. Финальная проверка:');
  
  if (runCommand('npx tsx check-db.ts', 'Проверка финального состояния БД', true)) {
    log('green', '✅ Все системы готовы к работе!');
  } else {
    log('red', '❌ Остались проблемы');
  }

  // 7. Инструкции по запуску
  log('cyan', '\n' + '='.repeat(50));
  log('cyan', '🎯 СЛЕДУЮЩИЕ ШАГИ:');
  log('cyan', '='.repeat(50));
  
  log('green', '\n1. Запустите сервер разработки:');
  log('blue', '   npm run dev');
  
  log('green', '\n2. Откройте в браузере:');
  log('blue', '   http://localhost:3000/player');
  
  log('green', '\n3. Для диагностики используйте:');
  log('blue', '   npm run db:check');
  log('blue', '   npm run db:studio');
  
  log('yellow', '\n💡 Полезные команды:');
  log('blue', '   npm run fix-db     - Полная переустановка БД');
  log('blue', '   npm run db:check   - Проверка состояния БД');
  log('blue', '   npm run db:studio  - Открыть Prisma Studio');
  
  log('cyan', '\n🎉 Система готова к использованию!');
}

if (require.main === module) {
  main();
}

module.exports = { main };
