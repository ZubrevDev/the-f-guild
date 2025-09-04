const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Пересоздание базы данных...');

try {
  // Удаляем старую базу данных
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️ Старая база данных удалена');
  }

  console.log('🔧 Применяем миграции...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

  console.log('🌱 Запускаем seeding...');
  execSync('npx tsx prisma/seed_fixed.ts', { stdio: 'inherit' });

  console.log('🔍 Генерируем Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('✅ База данных готова!');
  console.log('🚀 Запускайте проект командой: npm run dev');

} catch (error) {
  console.error('❌ Ошибка при инициализации базы данных:', error.message);
  process.exit(1);
}
