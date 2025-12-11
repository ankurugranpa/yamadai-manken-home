import type { BulkRegisterResult, ImageRegistrationInput, WorkPage, WorkPagesResponse } from "../types/index.js";
import type { EnvBindings, KVNamespace } from "../types/cloudflare.js";

export interface WorksRepository {
  listPages(workId: string): Promise<WorkPagesResponse>;
  bulkUpsertImages(items: ImageRegistrationInput[]): Promise<BulkRegisterResult>;
  updatePages(workId: string, pages: WorkPage[]): Promise<void>;
  deleteImage(workId: string, page: number): Promise<void>;
}

export class KvWorksRepository implements WorksRepository {
  constructor(private readonly kv: KVNamespace) {}

  async listPages(workId: string): Promise<WorkPagesResponse> {
    const collected: WorkPage[] = [];
    let cursor: string | undefined;
    do {
      const res = await this.kv.list({ prefix: `${workId}:`, cursor });
      cursor = res.cursor;
      for (const key of res.keys) {
        const item = await this.kv.get<WorkPage>(key.name, "json");
        if (item) collected.push(item);
      }
    } while (cursor);

    collected.sort((a, b) => a.page - b.page);
    return { pages: collected };
  }

  async bulkUpsertImages(items: ImageRegistrationInput[]): Promise<BulkRegisterResult> {
    const failed: BulkRegisterResult["failed"] = [];
    await Promise.all(
      items.map(async (item) => {
        const key = `${item.workId}:${item.page}`;
        const record: WorkPage = {
          page: item.page,
          imageId: item.imageId,
          variants: item.variants ?? {},
          title: item.title,
          author: item.author,
          visibility: item.visibility,
        };
        try {
          await this.kv.put(key, JSON.stringify(record));
        } catch (err) {
          failed?.push({
            page: item.page,
            imageId: item.imageId,
            reason: err instanceof Error ? err.message : "unknown_error",
          });
        }
      }),
    );

    return failed && failed.length > 0 ? { ok: false, failed } : { ok: true };
  }

  async updatePages(workId: string, pages: WorkPage[]): Promise<void> {
    // 上書き保存。不要なキーは削除する。
    const existing = await this.listPages(workId);
    const keepKeys = new Set(pages.map((p) => `${workId}:${p.page}`));

    await Promise.all(
      pages.map((page) =>
        this.kv.put(`${workId}:${page.page}`, JSON.stringify(page)),
      ),
    );

    await Promise.all(
      existing.pages
        .map((p) => `${workId}:${p.page}`)
        .filter((k) => !keepKeys.has(k))
        .map((k) => this.kv.delete(k)),
    );
  }

  async deleteImage(workId: string, page: number): Promise<void> {
    await this.kv.delete(`${workId}:${page}`);
  }
}

export const createKvWorksRepository = (env: EnvBindings): WorksRepository =>
  new KvWorksRepository(env.KV_WORKS);
