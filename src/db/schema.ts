import { pgTable, serial, integer, timestamp, doublePrecision, date } from 'drizzle-orm/pg-core';

export const calories = pgTable('calories', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  date: timestamp('date').defaultNow().notNull(),
});

export const metrics = pgTable('metrics', {
  id: serial('id').primaryKey(),
  weight: doublePrecision('weight').notNull(),
  day: date('day').defaultNow().notNull().unique(),
  date: timestamp('date').defaultNow().notNull(),
});