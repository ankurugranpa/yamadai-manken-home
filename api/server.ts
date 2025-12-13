import { CloudflareImagesRepository } from "./repositories/imagesRepository.js";
import { createKvWorksRepository } from "./repositories/worksRepository.js";
import { generateUploadUrls } from "./usecases/generateUploadUrls.js";
import { registerImages } from "./usecases/registerImages.js";
import { listWorkPages } from "./usecases/listWorkPages.js";
import { updateWorkPages } from "./usecases/updateWorkPages.js";
import { deleteImage } from "./usecases/deleteImage.js";
import type { EnvBindings } from "./types/cloudflare.js";
import type { ImageRegistrationInput, WorkPage } from "./types/index.js";

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const parseJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch (err) {
    throw new Error(`invalid_json: ${err instanceof Error ? err.message : "unknown"}`);
  }
};

const notFound = () => new Response("not found", { status: 404 });

const badRequest = (msg: string) => jsonResponse({ error: msg }, 400);

const methodNotAllowed = () => new Response("method not allowed", { status: 405 });

const extractWorkId = (pathname: string): string | null => {
  const match = pathname.match(/^\/(?:admin\/api|works)\/([^/]+)\/pages\/?$/);
  return match ? match[1] : null;
};

const extractDeleteParams = (pathname: string): { imageId: string } | null => {
  const match = pathname.match(/^\/admin\/api\/images\/([^/]+)$/);
  return match ? { imageId: match[1] } : null;
};

export default {
  async fetch(request: Request, env: EnvBindings): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    const imagesRepo = new CloudflareImagesRepository(env);
    const worksRepo = createKvWorksRepository(env);

    if (pathname === "/admin/api/images/upload-url") {
      if (request.method !== "POST") return methodNotAllowed();
      const body = await parseJson<{ count?: number }>(request);
      const count = body.count ?? 1;
      try {
        const result = await generateUploadUrls(imagesRepo, count);
        return jsonResponse(result);
      } catch (err) {
        return jsonResponse(
          { error: "upload_url_error", message: err instanceof Error ? err.message : "unknown" },
          500,
        );
      }
    }

    if (pathname === "/admin/api/images") {
      if (request.method !== "POST") return methodNotAllowed();
      const body = await parseJson<{ images: ImageRegistrationInput[] }>(request);
      if (!Array.isArray(body.images)) return badRequest("images array required");
      const result = await registerImages(worksRepo, imagesRepo, body.images);
      return jsonResponse(result, result.ok ? 200 : 207);
    }

    if (pathname.startsWith("/admin/api/works/") && pathname.endsWith("/pages")) {
      const workId = extractWorkId(pathname);
      if (!workId) return notFound();

      if (request.method === "GET") {
        const result = await listWorkPages(worksRepo, workId);
        return jsonResponse(result);
      }

      if (request.method === "PUT") {
        const body = await parseJson<{ pages: WorkPage[] }>(request);
        if (!Array.isArray(body.pages)) return badRequest("pages array required");
        await updateWorkPages(worksRepo, workId, body.pages);
        return jsonResponse({ ok: true });
      }

      return methodNotAllowed();
    }

    if (pathname.startsWith("/works/") && pathname.endsWith("/pages")) {
      const workId = extractWorkId(pathname);
      if (!workId) return notFound();
      const result = await listWorkPages(worksRepo, workId);
      return jsonResponse(result);
    }

    if (pathname.startsWith("/admin/api/images/")) {
      const params = extractDeleteParams(pathname);
      if (!params) return notFound();
      if (request.method !== "DELETE") return methodNotAllowed();
      const workId = new URL(request.url).searchParams.get("workId");
      const page = Number(new URL(request.url).searchParams.get("page"));
      if (!workId || Number.isNaN(page)) return badRequest("workId and page are required");
      await deleteImage(imagesRepo, worksRepo, workId, page, params.imageId);
      return jsonResponse({ ok: true });
    }

    return notFound();
  },
};
