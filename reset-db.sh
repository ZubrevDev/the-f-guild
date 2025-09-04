#!/bin/bash

echo "🔄 Пересоздание базы данных..."

# Удаляем старую базу данных
rm -f prisma/dev.db

echo "🗄️ Применяем миграции..."
npx prisma migrate dev --name init

echo "🌱 Запускаем seeding..."
npx tsx prisma/seed_fixed.ts

echo "🔍 Генерируем Prisma Client..."
npx prisma generate

echo "✅ База данных готова!"
echo "🚀 Запускайте проект командой: npm run dev"
