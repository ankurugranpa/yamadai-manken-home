import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { CloudflareImagesRepository, MockImagesRepository } from "./repositories/imagesRepository.js";
import { createKvWorksRepository } from "./repositories/worksRepository.js";
import { generateUploadUrls } from "./usecases/generateUploadUrls.js";
import { registerImages } from "./usecases/registerImages.js";
import { listWorkPages } from "./usecases/listWorkPages.js";
import { updateWorkPages } from "./usecases/updateWorkPages.js";
import { deleteImage } from "./usecases/deleteImage.js";
import type { EnvBindings } from "./types/cloudflare.js";
import type { ImageRegistrationInput, WorkPage } from "./types/index.js";
import { createSession, requireAdmin } from "./middleware/auth.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

type AppEnv = { Bindings: EnvBindings; Variables: { user?: { email: string } } };

const app = new Hono<AppEnv>();

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const parseJson = async <T>(request: Request): Promise<T> => {
  return (await request.json()) as T;
};

const notFound = () => new Response("not found", { status: 404 });

const methodNotAllowed = () => new Response("method not allowed", { status: 405 });

const getImagesRepo = (env: EnvBindings) => {
  if (env.MOCK_IMAGES === "true") return new MockImagesRepository();
  return new CloudflareImagesRepository(env);
};

const isSecureRequest = (req: Request) => {
  const protocol = new URL(req.url).protocol;
  return protocol === "https:";
};

// Google OAuth 認証ルート
const randomState = () => {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/=+$/, "");
};

app.get("/auth/google", async (c) => {
  const redirect = c.req.query("redirect") ?? "/admin/";
  const state = randomState();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    secure: isSecureRequest(c.req.raw),
    sameSite: "Lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: c.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
    redirect,
  });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return c.redirect(authUrl, 302);
});

app.get("/auth/google/callback", async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const redirect = url.searchParams.get("redirect") ?? "/admin/";
  const stateCookie = getCookie(c, "oauth_state");
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return jsonResponse({ error: "state_mismatch" }, 400);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return jsonResponse({ error: "token_exchange_failed", detail: body }, 400);
  }

  const tokenJson = (await tokenRes.json()) as { id_token: string };
  if (!tokenJson.id_token) return jsonResponse({ error: "no_id_token" }, 400);

  const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
  const { payload } = await jwtVerify(tokenJson.id_token, JWKS, {
    issuer: "https://accounts.google.com",
    audience: c.env.GOOGLE_CLIENT_ID,
  });

  const email = payload.email as string | undefined;
  if (!email) return jsonResponse({ error: "email_not_found" }, 400);

  const token = await createSession(email, c.env);
  setCookie(c, "session", token, {
    httpOnly: true,
    secure: isSecureRequest(c.req.raw),
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  deleteCookie(c, "oauth_state", { path: "/" });
  return c.redirect(redirect, 302);
});

app.post("/auth/logout", (c) => {
  deleteCookie(c, "session", { path: "/" });
  return c.json({ ok: true });
});

// 公開API
app.get("/works/:id/pages", async (c) => {
  const workId = c.req.param("id");
  const worksRepo = createKvWorksRepository(c.env);
  const result = await listWorkPages(worksRepo, workId);
  return jsonResponse(result);
});

// 管理系（認証必須）
app.use("/admin/*", requireAdmin);

app.post("/admin/api/images/upload-url", async (c) => {
  const imagesRepo = getImagesRepo(c.env);
  const body = await parseJson<{ count?: number }>(c.req.raw);
  const count = body.count ?? 1;
  const result = await generateUploadUrls(imagesRepo, count);
  return jsonResponse(result);
});

app.post("/admin/api/images", async (c) => {
  const imagesRepo = getImagesRepo(c.env);
  const worksRepo = createKvWorksRepository(c.env);
  const body = await parseJson<{ images: ImageRegistrationInput[] }>(c.req.raw);
  if (!Array.isArray(body.images)) return jsonResponse({ error: "images array required" }, 400);
  const result = await registerImages(worksRepo, imagesRepo, body.images);
  return jsonResponse(result, result.ok ? 200 : 207);
});

app.get("/admin/api/works/:id/pages", async (c) => {
  const workId = c.req.param("id");
  const worksRepo = createKvWorksRepository(c.env);
  const result = await listWorkPages(worksRepo, workId);
  return jsonResponse(result);
});

app.put("/admin/api/works/:id/pages", async (c) => {
  const workId = c.req.param("id");
  const worksRepo = createKvWorksRepository(c.env);
  const body = await parseJson<{ pages: WorkPage[] }>(c.req.raw);
  if (!Array.isArray(body.pages)) return jsonResponse({ error: "pages array required" }, 400);
  await updateWorkPages(worksRepo, workId, body.pages);
  return jsonResponse({ ok: true });
});

app.delete("/admin/api/images/:id", async (c) => {
  const imageId = c.req.param("id");
  const workId = c.req.query("workId");
  const page = Number(c.req.query("page"));
  if (!workId || Number.isNaN(page)) return jsonResponse({ error: "workId and page are required" }, 400);
  const imagesRepo = getImagesRepo(c.env);
  const worksRepo = createKvWorksRepository(c.env);
  await deleteImage(imagesRepo, worksRepo, workId, page, imageId);
  return jsonResponse({ ok: true });
});

// 管理画面の簡易HTMLを返す
app.get("/admin/", () =>
  new Response(
    `<!doctype html>
    <html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Admin</title>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 20% 20%,#f0f4ff,#e8f5ff 40%,#fff 80%);font-family:Helvetica,Arial,sans-serif;color:#1b1f3a;}
    .card{padding:2.5rem 3rem;border-radius:16px;background:#ffffffee;box-shadow:0 10px 30px rgba(0,0,0,0.08);text-align:center;max-width:480px;}
    h1{margin:0 0 .75rem;font-size:1.8rem;letter-spacing:.02em;}
    p{margin:0;color:#4c5672;line-height:1.6;}
    </style></head><body><div class="card"><h1>Admin ログイン完了</h1><p>管理エリアにアクセスできる状態です。</p></div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  ));

app.all("*", () => notFound());

export default app;
