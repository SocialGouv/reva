import { prismaClient } from "../../../prisma/client";
import { ExamInfo } from "../jury.types";

export const getExamInfo = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<ExamInfo | null> => {
  return prismaClient.examInfo.findUnique({
    where: { candidacyId },
  });
};
