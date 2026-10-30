import { hashPassword, verifyPassword } from "@/lib/crypto";
import { getSql, isNeonConfigured } from "./neon";
import {
  findUserByEmail as storeFindByEmail,
  findUserById as storeFindById,
  publicUser,
  saveStore,
  type DbUser,
  type Role,
} from "@/lib/store";

export type { DbUser, Role };
export { publicUser };

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  role: string;
  created_at: string;
};

function mapRow(r: ProfileRow): DbUser {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash || "",
    role: (r.role === "admin" ? "admin" : "user") as Role,
    createdAt: r.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const normalized = email.toLowerCase();
  if (isNeonConfigured()) {
    const sql = getSql()!;
    const rows = (await sql`
      SELECT id, email, name, password_hash, role, created_at::text
      FROM profiles WHERE lower(email) = ${normalized} LIMIT 1
    `) as ProfileRow[];
    return rows[0] ? mapRow(rows[0]) : undefined;
  }
  return storeFindByEmail(normalized);
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  if (isNeonConfigured()) {
    const sql = getSql()!;
    const rows = (await sql`
      SELECT id, email, name, password_hash, role, created_at::text
      FROM profiles WHERE id::text = ${id} LIMIT 1
    `) as ProfileRow[];
    return rows[0] ? mapRow(rows[0]) : undefined;
  }
  return storeFindById(id);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role?: Role;
}): Promise<DbUser> {
  const email = input.email.toLowerCase();
  const passwordHash = hashPassword(input.password);
  const role = input.role || "user";

  if (isNeonConfigured()) {
    const sql = getSql()!;
    const rows = (await sql`
      INSERT INTO profiles (email, name, password_hash, role)
      VALUES (${email}, ${input.name}, ${passwordHash}, ${role})
      RETURNING id, email, name, password_hash, role, created_at::text
    `) as ProfileRow[];
    return mapRow(rows[0]);
  }

  const id = `user-${Date.now()}`;
  const user: DbUser = {
    id,
    email,
    name: input.name,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  saveStore((db) => {
    db.users.push(user);
  });
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<DbUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

/** Ensure demo accounts exist in Neon (idempotent; refreshes passwords). */
export async function ensureDemoUsers() {
  if (!isNeonConfigured()) return;
  const sql = getSql()!;
  const demos: { email: string; name: string; password: string; role: Role }[] = [
    { email: "admin@tappath.com", name: "Admin", password: "admin1234", role: "admin" },
    { email: "user@tappath.com", name: "Demo User", password: "user1234", role: "user" },
  ];
  for (const d of demos) {
    const hash = hashPassword(d.password);
    const existing = (await sql`
      SELECT id FROM profiles WHERE lower(email) = ${d.email} LIMIT 1
    `) as { id: string }[];
    if (existing[0]) {
      await sql`
        UPDATE profiles
        SET password_hash = ${hash}, role = ${d.role}, name = ${d.name}
        WHERE id::text = ${String(existing[0].id)}
      `;
    } else {
      await sql`
        INSERT INTO profiles (email, name, password_hash, role)
        VALUES (${d.email}, ${d.name}, ${hash}, ${d.role})
      `;
    }
  }
}
