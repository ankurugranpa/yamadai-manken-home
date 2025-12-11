// 共通型定義

export type Visibility = "public" | "private";

export type VariantMap = Record<string, string>;

export interface WorkPage {
  page: number;
  imageId: string;
  variants: VariantMap;
  title?: string;
  author?: string;
  visibility?: Visibility;
}

export interface ImageRegistrationInput {
  workId: string;
  page: number;
  imageId: string;
  title?: string;
  author?: string;
  visibility?: Visibility;
  variants?: VariantMap;
}

export interface UploadUrlItem {
  id: string;
  uploadURL: string;
  expiresAt: string;
}

export interface UploadUrlResponse {
  items: UploadUrlItem[];
}

export interface BulkRegisterResult {
  ok: boolean;
  failed?: Array<{ page: number; imageId: string; reason: string }>;
}

export interface WorkPagesResponse {
  pages: WorkPage[];
}
