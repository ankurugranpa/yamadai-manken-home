import type { UploadUrlItem } from "../types/index.js";
import type { EnvBindings } from "../types/cloudflare.js";

export interface ImagesRepository {
  createDirectUploadUrls(count: number): Promise<UploadUrlItem[]>;
  deleteImage(imageId: string): Promise<void>;
}

export class CloudflareImagesRepository implements ImagesRepository {
  constructor(private readonly env: EnvBindings) {}

  async createDirectUploadUrls(count: number): Promise<UploadUrlItem[]> {
    const results: UploadUrlItem[] = [];
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/images/v2/direct_upload`;
    const headers = { Authorization: `Bearer ${this.env.CF_API_TOKEN}` };

    for (let i = 0; i < count; i += 1) {
      const res = await fetch(url, { method: "POST", headers });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`direct_upload_failed: ${res.status} ${body}`);
      }
      const data = (await res.json()) as {
        result: { id: string; uploadURL: string; expiration: number };
      };
      results.push({
        id: data.result.id,
        uploadURL: data.result.uploadURL,
        expiresAt: new Date(data.result.expiration * 1000).toISOString(),
      });
    }
    return results;
  }

  async deleteImage(imageId: string): Promise<void> {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.env.CF_API_TOKEN}` },
      },
    );
    if (!res.ok && res.status !== 404) {
      const body = await res.text();
      throw new Error(`delete_failed: ${res.status} ${body}`);
    }
  }
}
