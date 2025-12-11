// 最小限のCloudflare Worker向け型

export interface KVNamespace {
  get<T = string>(key: string, type?: "text" | "json" | "stream"): Promise<T | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer | ArrayBufferView, options?: KVPutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
}

export interface KVPutOptions {
  expiration?: number;
  expirationTtl?: number;
}

export interface EnvBindings {
  CF_ACCOUNT_ID: string;
  CF_API_TOKEN: string;
  CF_IMAGES_ACCOUNT_HASH: string;
  KV_WORKS: KVNamespace;
  MOCK_IMAGES?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  SESSION_SECRET: string;
  ALLOWED_EMAILS?: string;
  ALLOWED_DOMAIN?: string;
}
