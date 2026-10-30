import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function isNeonConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!isNeonConfigured()) return null;
  if (!sql) {
    const url = process.env.DATABASE_URL!.replace(/&?channel_binding=require/, "");
    sql = neon(url);
  }
  return sql;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const client = getSql();
  if (!client) throw new Error("DATABASE_URL is not set");
  const rows = await (client as any)(strings, ...values);
  return rows as T[];
}

export async function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T | null> {
  const rows = await query<T>(strings, ...values);
  return rows[0] ?? null;
}
