import type { WorksRepository } from "../repositories/worksRepository.js";
import type { WorkPage } from "../types/index.js";

export const updateWorkPages = async (
  worksRepo: WorksRepository,
  workId: string,
  pages: WorkPage[],
): Promise<void> => {
  await worksRepo.updatePages(workId, pages);
};
