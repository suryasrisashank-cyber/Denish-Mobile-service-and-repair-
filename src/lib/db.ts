// DENISH MOBILE REPAIRING AND SERVICE
// Database Connection & Management Layer
// Supports Neon Serverless PostgreSQL (Primary / Vercel Production) & SQLite (Fallback)

import { neon, Pool } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { SCHEMA_SQL } from "@/lib/schema-sql";

export interface DbStatement {
  get<T = unknown>(...params: unknown[]): Promise<T | undefined>;
  all<T = unknown>(...params: unknown[]): Promise<T[]>;
  run(...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }>;
}

export interface AppDatabase {
  prepare(sql: string): DbStatement;
  exec(sql: string): Promise<void>;
  pragma?(cmd: string): unknown;
  isPostgres: boolean;
  raw?: unknown;
}

let pgInstance: AppDatabase | null = null;
let sqliteInstance: AppDatabase | null = null;

function cleanConnectionString(url: string): string {
  let cleaned = url.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export function normalizeSqlForPostgres(sql: string): string {
  let text = sql;

  // Replace sqlite datetime/date functions
  text = text.replace(/datetime\(\s*'now'\s*,\s*'-(\d+)\s+minutes?'\s*\)/gi, "(CURRENT_TIMESTAMP - INTERVAL '$1 minutes')");
  text = text.replace(/datetime\(\s*'now'\s*,\s*'-(\d+)\s+days?'\s*\)/gi, "(CURRENT_TIMESTAMP - INTERVAL '$1 days')");
  text = text.replace(/datetime\(\s*'now'\s*,\s*'-(\d+)\s+hours?'\s*\)/gi, "(CURRENT_TIMESTAMP - INTERVAL '$1 hours')");
  text = text.replace(/datetime\(\s*'now'\s*\)/gi, "CURRENT_TIMESTAMP");
  text = text.replace(/DATE\(\s*'now'\s*\)/gi, "CURRENT_DATE");
  text = text.replace(/strftime\(\s*'%Y-%m'\s*,\s*updated_at\s*\)\s*=\s*strftime\(\s*'%Y-%m'\s*,\s*'now'\s*\)/gi, "to_char(updated_at, 'YYYY-MM') = to_char(CURRENT_TIMESTAMP, 'YYYY-MM')");
  text = text.replace(/strftime\(\s*'%Y-%m'\s*,\s*ro\.updated_at\s*\)\s*=\s*strftime\(\s*'%Y-%m'\s*,\s*'now'\s*\)/gi, "to_char(ro.updated_at, 'YYYY-MM') = to_char(CURRENT_TIMESTAMP, 'YYYY-MM')");

  // Replace ? placeholders with $1, $2, ...
  let paramIndex = 1;
  text = text.replace(/\?/g, () => `$${paramIndex++}`);

  // Auto-append RETURNING id for INSERT statements if not present
  const trimmed = text.trim();
  if (/^INSERT\s+INTO/i.test(trimmed) && !/RETURNING\s+/i.test(trimmed)) {
    text = `${trimmed} RETURNING id`;
  }

  return text;
}

function createNeonDatabase(connectionString: string): AppDatabase {
  const cleanUrl = cleanConnectionString(connectionString);
  const sql = neon(cleanUrl, { fullResults: true });
  const pool = new Pool({ connectionString: cleanUrl });

  return {
    isPostgres: true,
    prepare(rawSql: string): DbStatement {
      const pgSql = normalizeSqlForPostgres(rawSql);

      return {
        async get<T = unknown>(...params: unknown[]): Promise<T | undefined> {
          const res = await sql.query(pgSql, params);
          return (res.rows?.[0] !== undefined ? res.rows[0] : undefined) as T | undefined;
        },
        async all<T = unknown>(...params: unknown[]): Promise<T[]> {
          const res = await sql.query(pgSql, params);
          return (res.rows || []) as T[];
        },
        async run(...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
          const res = await sql.query(pgSql, params);
          const lastInsertRowid = res.rows?.[0]?.id !== undefined ? Number(res.rows[0].id) : 0;
          return {
            changes: res.rowCount || 0,
            lastInsertRowid,
          };
        },
      };
    },
    async exec(rawSql: string): Promise<void> {
      await pool.query(rawSql);
    },
    pragma() {
      // No-op in PostgreSQL
      return null;
    },
  };
}

function createSqliteDatabase(): AppDatabase {
  if (sqliteInstance) return sqliteInstance;

  // Dynamically require better-sqlite3 only when PostgreSQL is not configured
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");

  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.LAMBDA_TASK_ROOT
  );

  let dbPath = process.env.DATABASE_PATH;
  if (!dbPath) {
    if (isServerless) {
      const tmpDb = path.join("/tmp", "denish.sqlite");
      const repoDb = path.join(process.cwd(), "data", "denish.sqlite");
      if (fs.existsSync(repoDb) && !fs.existsSync(tmpDb)) {
        try { fs.copyFileSync(repoDb, tmpDb); } catch {}
      }
      dbPath = tmpDb;
    } else {
      let dbDir = path.join(process.cwd(), "data");
      try {
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      } catch {
        dbDir = "/tmp";
      }
      dbPath = path.join(dbDir, "denish.sqlite");
    }
  }

  const rawDb = new Database(dbPath);
  try { rawDb.pragma("journal_mode = WAL"); } catch { rawDb.pragma("journal_mode = DELETE"); }
  rawDb.pragma("foreign_keys = ON");
  rawDb.pragma("synchronous = NORMAL");

  const schemaPath = path.join(process.cwd(), "src", "data", "schema.sql");
  const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, "utf8") : SCHEMA_SQL;
  rawDb.exec(schemaSql);

  sqliteInstance = {
    isPostgres: false,
    prepare(sql: string) {
      const stmt = rawDb.prepare(sql);
      return {
        async get(...params: unknown[]) { return stmt.get(...params); },
        async all(...params: unknown[]) { return stmt.all(...params); },
        async run(...params: unknown[]) { return stmt.run(...params); },
      };
    },
    async exec(sql: string) {
      rawDb.exec(sql);
    },
    pragma(cmd: string) {
      return rawDb.pragma(cmd);
    },
    raw: rawDb,
  };

  return sqliteInstance;
}

export function getDatabase(): AppDatabase {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (databaseUrl && databaseUrl.trim().length > 0) {
    if (!pgInstance) {
      pgInstance = createNeonDatabase(databaseUrl);
    }
    return pgInstance;
  }

  return createSqliteDatabase();
}

/**
 * Executes a function within an atomic transaction.
 */
export async function runInTransaction<T>(fn: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  const db = getDatabase();

  if (db.isPostgres) {
    const databaseUrl = cleanConnectionString((process.env.DATABASE_URL || process.env.POSTGRES_URL)!);
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const txDb: AppDatabase = {
        isPostgres: true,
        prepare(rawSql: string): DbStatement {
          const pgSql = normalizeSqlForPostgres(rawSql);
          return {
            async get<T = unknown>(...params: unknown[]): Promise<T | undefined> {
              const res = await client.query(pgSql, params);
              return (res.rows?.[0] !== undefined ? res.rows[0] : undefined) as T | undefined;
            },
            async all<T = unknown>(...params: unknown[]): Promise<T[]> {
              const res = await client.query(pgSql, params);
              return (res.rows || []) as T[];
            },
            async run(...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
              const res = await client.query(pgSql, params);
              const lastInsertRowid = res.rows?.[0]?.id !== undefined ? Number(res.rows[0].id) : 0;
              return { changes: res.rowCount || 0, lastInsertRowid };
            },
          };
        },
        async exec(rawSql: string): Promise<void> {
          await client.query(rawSql);
        },
        pragma() { return null; },
      };

      const result = await fn(txDb);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // SQLite fallback
  const sqlite = db as unknown as { raw?: { transaction: (cb: () => unknown) => () => unknown } };
  if (sqlite.raw) {
    const tx = sqlite.raw.transaction(() => fn(db));
    return tx() as T;
  }

  return fn(db);
}
