-- Создаем тестовую гильдию
INSERT INTO guilds (id, name, description, code, memberCount, activeQuests, completedToday, ownerId, createdAt, updatedAt) 
VALUES ('guild-1', 'Семья Драконоборцев', 'Веселая семейная гильдия', 'DRAGON1', 3, 5, 2, (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now'));

-- Привязываем всех пользователей к гильдии  
UPDATE users SET guildId = 'guild-1', updatedAt = datetime('now');

-- Создаем персонажей
INSERT INTO characters (id, userId, guildId, name, class, avatar, level, experience, maxExperience, bronzeCoins, silverCoins, goldCoins, streak, completedQuests, totalGoldEarned, activeTitle, createdAt, updatedAt)
SELECT 
  'char-' || ROW_NUMBER() OVER(),
  u.id,
  'guild-1',
  CASE ROW_NUMBER() OVER()
    WHEN 1 THEN 'Алиса Храбрая'
    WHEN 2 THEN 'Макс Мудрец' 
    ELSE 'Герой ' || ROW_NUMBER() OVER()
  END,
  CASE ROW_NUMBER() OVER()
    WHEN 1 THEN '🛡️ Паладин'
    WHEN 2 THEN '🧙‍♂️ Волшебник'
    ELSE '⚔️ Воин'
  END,
  CASE ROW_NUMBER() OVER()
    WHEN 1 THEN '👸'
    WHEN 2 THEN '🧙‍♂️'
    ELSE '⚔️'
  END,
  CAST((ABS(RANDOM()) % 5) + 1 AS INTEGER),
  CAST((ABS(RANDOM()) % 500) + 100 AS INTEGER),
  1000,
  CAST((ABS(RANDOM()) % 20) + 5 AS INTEGER),
  CAST((ABS(RANDOM()) % 10) + 2 AS INTEGER),
  CAST((ABS(RANDOM()) % 5) + 1 AS INTEGER),
  CAST(ABS(RANDOM()) % 10 AS INTEGER),
  CAST((ABS(RANDOM()) % 30) + 10 AS INTEGER),
  CAST((ABS(RANDOM()) % 100) + 20 AS INTEGER),
  'Новичок',
  datetime('now'),
  datetime('now')
FROM users u;

-- Создаем квесты
INSERT INTO quests (id, title, description, type, difficulty, expReward, bronzeReward, silverReward, goldReward, status, assignedToId, guildId, createdById, createdAt, updatedAt)
VALUES 
  ('quest-1', 'Выучить таблицу умножения на 7', 'Повторить таблицу умножения на 7', 'DAILY', 3, 50, 5, 2, 0, 'ACTIVE', (SELECT id FROM characters LIMIT 1), 'guild-1', (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now')),
  ('quest-2', 'Помыть посуду после обеда', 'Помыть всю посуду и убрать', 'DAILY', 2, 30, 3, 1, 0, 'ACTIVE', (SELECT id FROM characters LIMIT 1 OFFSET 1), 'guild-1', (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now')),
  ('quest-3', 'Семейная прогулка в парк', 'Пойти в парк всей семьей', 'WEEKLY', 2, 100, 10, 5, 2, 'PENDING', NULL, 'guild-1', (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now')),
  ('quest-4', 'Прочитать 10 страниц книги', 'Прочитать книгу', 'DAILY', 3, 40, 4, 2, 0, 'ACTIVE', (SELECT id FROM characters LIMIT 1), 'guild-1', (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now')),
  ('quest-5', 'Убрать свою комнату', 'Навести порядок в комнате', 'WEEKLY', 4, 80, 8, 4, 1, 'ACTIVE', (SELECT id FROM characters LIMIT 1 OFFSET 1), 'guild-1', (SELECT id FROM users LIMIT 1), datetime('now'), datetime('now'));

-- Создаем награды
INSERT INTO rewards (id, name, description, cost, category, isActive, guildId, createdAt, updatedAt)
VALUES 
  ('reward-1', '30 минут телефона', 'Дополнительное экранное время', 50, 'ENTERTAINMENT', true, 'guild-1', datetime('now'), datetime('now')),
  ('reward-2', 'Выбор фильма на вечер', 'Выбрать фильм для семьи', 75, 'ENTERTAINMENT', true, 'guild-1', datetime('now'), datetime('now')),
  ('reward-3', '100 рублей на карманные', 'Денежная награда', 200, 'MONEY', true, 'guild-1', datetime('now'), datetime('now'));

-- Обновляем счетчики в гильдии
UPDATE guilds SET 
  activeQuests = (SELECT COUNT(*) FROM quests WHERE guildId = 'guild-1' AND status = 'ACTIVE'),
  updatedAt = datetime('now')
WHERE id = 'guild-1';
