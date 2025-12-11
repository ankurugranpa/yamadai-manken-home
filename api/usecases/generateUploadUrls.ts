import type { UploadUrlResponse } from "../types/index.js";
import type { ImagesRepository } from "../repositories/imagesRepository.js";

export const generateUploadUrls = async (
  repo: ImagesRepository,
  count: number,
): Promise<UploadUrlResponse> => {
  const safeCount = Math.min(Math.max(count, 1), 100);
  const items = await repo.createDirectUploadUrls(safeCount);
  return { items };
};
