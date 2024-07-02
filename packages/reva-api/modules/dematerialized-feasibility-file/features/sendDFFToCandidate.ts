import { prismaClient } from "../../../prisma/client";
import { sendDFFNotificationToCandidateEmail } from "../emails";

export const sendDFFToCandidate = async ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) => {
  const now = new Date().toISOString();
  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: { sentToCandidateAt: now },
  });

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: { candidacy: { include: { candidate: true } } },
  });

  if (dff?.candidacy?.candidate?.email) {
    await sendDFFNotificationToCandidateEmail({
      email: dff.candidacy.candidate.email,
    });
  }

  return "Ok";
};
