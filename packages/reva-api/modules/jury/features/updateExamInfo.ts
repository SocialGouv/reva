import { prismaClient } from "../../../prisma/client";
import { ExamInfo } from "../jury.types";

export const updateExamInfo = async ({
  candidacyId,
  examInfo,
}: {
  candidacyId: string;
  examInfo: ExamInfo;
}): Promise<ExamInfo> => {
  return prismaClient.examInfo.update({
    where: { candidacyId },
    data: examInfo,
  });
};
