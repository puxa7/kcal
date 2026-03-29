import { createServer, IncomingMessage, ServerResponse } from "http";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { calories, metrics } from './db/schema';
import { envOrThrow } from './utils';
import { desc, sql } from 'drizzle-orm';
import { readFile } from "fs/promises";
import { join } from "path";

const PORT = 20191;

process.loadEnvFile();

const DB_URL = envOrThrow("DB_URL");

const queryClient = postgres(DB_URL);
const db = drizzle(queryClient);

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);

  // --- API BACKENDOWE ---

  // Pobieranie historii kalorii
  if (url.pathname === '/api/history/calories') {
    try {
      const calorieData = await db.select().from(calories).orderBy(desc(calories.date));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(calorieData));
      return;
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Błąd bazy danych (kalorie)");
      return;
    }
  }

  // Pobieranie historii wagi (limit 20)
  if (url.pathname === '/api/history/weight') {
    try {
      const weightData = await db.select().from(metrics).orderBy(desc(metrics.day)).limit(20);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(weightData));
      return;
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Błąd bazy danych (waga)");
      return;
    }
  }

  // Dodawanie kalorii
  if (url.pathname === '/api/add') {
    const kcal = parseInt(url.searchParams.get('kcal') || '0');
    try {
      await db.insert(calories).values({ amount: kcal });
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Zapisano kalorie!`);
      return;
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Błąd zapisu kalorii");
      return;
    }
  }

  // Dodawanie wagi - z obsługą podmiany (upsert)
  if (url.pathname === '/api/weight') {
    const weight = parseFloat(url.searchParams.get('value') || '0');
    const customDate = url.searchParams.get('date');
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDay = customDate || todayStr;

    try {
      await db.insert(metrics).values({ 
        weight: weight,
        day: targetDay
      }).onConflictDoUpdate({
        target: metrics.day,
        set: { weight: weight }
      });

      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Zapisano wagę dla dnia ${targetDay}!`);
      return;
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Błąd zapisu wagi");
      return;
    }
  }

  // --- SERWOWANIE FRONTENDU ---

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const content = await readFile(join(process.cwd(), "public", "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(content);
      return;
    } catch (err) {
      res.writeHead(404);
      res.end("Nie znaleziono pliku frontendowego");
      return;
    }
  }

  // Obsługa 404
  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serwer running na http://localhost:${PORT}`);
});