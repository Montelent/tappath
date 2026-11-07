import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type Role = "user" | "admin";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

export type ForumReply = {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ForumTopicRow = {
  id: string;
  title: string;
  brand: string;
  brandSlug: string;
  category: string;
  authorId: string;
  authorName: string;
  excerpt: string;
  body: string;
  solved: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type GuideFeedbackRow = {
  id: string;
  guideSlug: string;
  userId?: string;
  correct: boolean;
  createdAt: string;
};

export type StoreData = {
  users: DbUser[];
  topics: ForumTopicRow[];
  replies: ForumReply[];
  feedback: GuideFeedbackRow[];
};

const SEED: StoreData = {
  users: [],
  topics: [],
  replies: [],
  feedback: [],
};

type GlobalStore = { __tappathStore?: StoreData };

function canWriteFs(): boolean {
  try {
    const dir = join(process.cwd(), ".data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const probe = join(dir, ".write-probe");
    writeFileSync(probe, "1");
    return true;
  } catch {
    return false;
  }
}

function filePath(): string {
  return join(process.cwd(), ".data", "store.json");
}

function load(): StoreData {
  const g = globalThis as unknown as GlobalStore;
  if (g.__tappathStore) return g.__tappathStore;

  if (canWriteFs()) {
    try {
      const p = filePath();
      if (existsSync(p)) {
        const data = JSON.parse(readFileSync(p, "utf8")) as StoreData;
        g.__tappathStore = data;
        return data;
      }
    } catch {
      /* fall through */
    }
  }

  const data: StoreData = {
    users: SEED.users.map((u) => ({ ...u })),
    topics: SEED.topics.map((t) => ({ ...t })),
    replies: SEED.replies.map((r) => ({ ...r })),
    feedback: [],
  };
  g.__tappathStore = data;
  persist(data);
  return data;
}

function persist(data: StoreData) {
  const g = globalThis as unknown as GlobalStore;
  g.__tappathStore = data;
  if (!canWriteFs()) return;
  try {
    writeFileSync(filePath(), JSON.stringify(data, null, 2), "utf8");
  } catch {
    /* serverless */
  }
}

export function getStore(): StoreData {
  return load();
}

export function saveStore(mutator: (data: StoreData) => void) {
  const data = load();
  mutator(data);
  persist(data);
}

export function findUserByEmail(email: string): DbUser | undefined {
  return getStore().users.find((u) => u.email === email.toLowerCase());
}

export function findUserById(id: string): DbUser | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function publicUser(u: DbUser) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}
