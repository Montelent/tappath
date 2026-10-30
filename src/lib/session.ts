import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./crypto";
import { findUserById, publicUser } from "./db/users";

export const SESSION_COOKIE = "tappath_session";

export async function setSessionCookie(payload: {
  sub: string;
  email: string;
  name: string;
  role: "user" | "admin";
}) {
  const token = signSession(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await findUserById(session.sub);
  if (!user) {
    return {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    };
  }
  return publicUser(user);
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
