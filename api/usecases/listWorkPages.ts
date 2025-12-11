import type { WorksRepository } from "../repositories/worksRepository.js";
import type { WorkPagesResponse } from "../types/index.js";

export const listWorkPages = async (
  worksRepo: WorksRepository,
  workId: string,
): Promise<WorkPagesResponse> => {
  return worksRepo.listPages(workId);
};
