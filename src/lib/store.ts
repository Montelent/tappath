import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { hashPassword } from "./crypto";

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
  users: [
    {
      id: "admin-1",
      email: "admin@tappath.com",
      name: "Admin",
      passwordHash: hashPassword("admin1234"),
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-1",
      email: "user@tappath.com",
      name: "Demo User",
      passwordHash: hashPassword("user1234"),
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ],
  topics: [
    {
      id: "t1",
      title: "Google search bar keeps coming back after reboot",
      brand: "Samsung",
      brandSlug: "samsung",
      category: "Display",
      authorId: "user-1",
      authorName: "mira_k",
      excerpt: "Removed the widget but after restart it's back on the home screen…",
      body: "I removed the Google search bar widget but after every reboot it returns. One UI 7, S24 Ultra. Any permanent fix?",
      solved: true,
      views: 840,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "t2",
      title: "Private DNS won't stick on One UI 7",
      brand: "Samsung",
      brandSlug: "samsung",
      category: "Network",
      authorId: "user-1",
      authorName: "dev_nile",
      excerpt: "Set dns.google but after airplane mode it resets to Automatic.",
      body: "Private DNS keeps resetting to Automatic after toggling airplane mode.",
      solved: false,
      views: 312,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: "t3",
      title: "HyperOS battery drain after latest update",
      brand: "Xiaomi",
      brandSlug: "xiaomi",
      category: "Battery",
      authorId: "user-1",
      authorName: "redmi_user",
      excerpt: "Screen-on time dropped from 7h to 4h. Any Adaptive Battery tips?",
      body: "After the latest HyperOS update battery life got worse. Looking for Adaptive Battery or restricted apps tips.",
      solved: true,
      views: 2104,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  replies: [
    {
      id: "r1",
      topicId: "t1",
      authorId: "admin-1",
      authorName: "Admin",
      body: "Long-press → Remove is correct. If it returns after reboot, check if a third-party launcher or Good Lock is restoring the default layout.",
      createdAt: new Date(Date.now() - 7000000).toISOString(),
    },
  ],
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
