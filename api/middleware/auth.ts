import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import type { EnvBindings } from "../types/cloudflare.js";

export interface SessionPayload {
  sub: string;
  email: string;
  exp: number;
}

const encoder = new TextEncoder();

const isAllowedEmail = (email: string, env: EnvBindings): boolean => {
  const list = env.ALLOWED_EMAILS?.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const domain = env.ALLOWED_DOMAIN?.toLowerCase();
  if (list && list.length > 0 && list.includes(email.toLowerCase())) return true;
  if (domain && email.toLowerCase().endsWith(`@${domain}`)) return true;
  // 許可リスト未設定なら通す
  if (!list && !domain) return true;
  return false;
};

export const createSession = async (email: string, env: EnvBindings): Promise<string> => {
  const secret = encoder.encode(env.SESSION_SECRET);
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(secret);
};

export const verifySession = async (token: string, env: EnvBindings): Promise<SessionPayload> => {
  const secret = encoder.encode(env.SESSION_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
};

export const requireAdmin = async (c: Context<{ Bindings: EnvBindings; Variables: { user?: SessionPayload } }>, next: Next) => {
  const token = getCookie(c, "session");
  if (!token) {
    return c.redirect(`/auth/google?redirect=${encodeURIComponent(c.req.url)}`, 302);
  }
  try {
    const payload = await verifySession(token, c.env);
    if (!isAllowedEmail(payload.email, c.env)) {
      return c.text("Forbidden", 403);
    }
    c.set("user", payload);
    await next();
  } catch (_err) {
    return c.redirect(`/auth/google?redirect=${encodeURIComponent(c.req.url)}`, 302);
  }
};
