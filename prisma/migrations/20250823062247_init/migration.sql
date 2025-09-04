-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "bronzeCost" INTEGER NOT NULL DEFAULT 0,
    "silverCost" INTEGER NOT NULL DEFAULT 0,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rewards" ("bronzeCost", "category", "description", "goldCost", "guildId", "icon", "id", "isActive", "name", "rarity", "silverCost", "stock") SELECT "bronzeCost", "category", "description", "goldCost", "guildId", "icon", "id", "isActive", "name", "rarity", "silverCost", "stock" FROM "rewards";
DROP TABLE "rewards";
ALTER TABLE "new_rewards" RENAME TO "rewards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
