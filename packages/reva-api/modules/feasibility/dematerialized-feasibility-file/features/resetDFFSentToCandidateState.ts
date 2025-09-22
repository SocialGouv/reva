import { DematerializedFeasibilityFile } from "@prisma/client";

import { deleteFile } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

export const resetDFFSentToCandidateState = async (
  dff: DematerializedFeasibilityFile,
) => {
  if (dff.sentToCandidateAt) {
    await prismaClient.dematerializedFeasibilityFile.update({
      where: { id: dff.id },
      data: {
        sentToCandidateAt: null,
        candidateConfirmationAt: null,
        candidateDecisionComment: null,
      },
    });
  }

  if (dff.swornStatementFileId) {
    const existingSwornStatementFile = await prismaClient.file.findUnique({
      where: { id: dff.swornStatementFileId },
    });

    if (existingSwornStatementFile) {
      await deleteFile(existingSwornStatementFile.path);
      await prismaClient.file.delete({
        where: { id: dff.swornStatementFileId },
      });
    }
  }
};
