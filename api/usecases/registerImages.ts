import type { ImagesRepository } from "../repositories/imagesRepository.js";
import type { WorksRepository } from "../repositories/worksRepository.js";
import type { BulkRegisterResult, ImageRegistrationInput } from "../types/index.js";

export const registerImages = async (
  worksRepo: WorksRepository,
  _imagesRepo: ImagesRepository,
  items: ImageRegistrationInput[],
): Promise<BulkRegisterResult> => {
  // _imagesRepo は将来の検証/同期用に残す
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, failed: [{ page: -1, imageId: "n/a", reason: "empty_payload" }] };
  }
  return worksRepo.bulkUpsertImages(items);
};
