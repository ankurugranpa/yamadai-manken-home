import type { ImagesRepository } from "../repositories/imagesRepository.js";
import type { WorksRepository } from "../repositories/worksRepository.js";

export const deleteImage = async (
  imagesRepo: ImagesRepository,
  worksRepo: WorksRepository,
  workId: string,
  page: number,
  imageId: string,
): Promise<void> => {
  await worksRepo.deleteImage(workId, page);
  await imagesRepo.deleteImage(imageId);
};
