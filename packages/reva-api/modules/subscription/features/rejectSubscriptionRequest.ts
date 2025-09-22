import { deleteFile } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { sendRejectionEmail } from "../emails/rejection";

export const rejectSubscriptionRequest = async ({
  subscriptionRequestId,
  reason,
  internalComment,
}: {
  subscriptionRequestId: string;
  reason: string;
  internalComment?: string;
}) => {
  const subscriptionRequest = await prismaClient.subscriptionRequest.findUnique(
    {
      where: { id: subscriptionRequestId },
    },
  );

  if (!subscriptionRequest) {
    throw new Error("Demande d'inscription non trouvée");
  }

  await prismaClient.subscriptionRequest.update({
    where: { id: subscriptionRequestId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      internalComment,
      attestationURSSAFFileId: null,
      justificatifIdentiteDirigeantFileId: null,
      lettreDeDelegationFileId: null,
      justificatifIdentiteDelegataireFileId: null,
    },
  });

  const filesIds = [
    subscriptionRequest?.attestationURSSAFFileId,
    subscriptionRequest?.justificatifIdentiteDirigeantFileId,
    subscriptionRequest?.lettreDeDelegationFileId,
    subscriptionRequest?.justificatifIdentiteDelegataireFileId,
  ].filter((d) => !!d) as string[];

  const files = await prismaClient.file.findMany({
    where: { id: { in: filesIds } },
  });

  await Promise.all(files.map((f) => deleteFile(f.path)));

  await prismaClient.file.deleteMany({
    where: { id: { in: filesIds } },
  });

  await sendRejectionEmail({
    email: subscriptionRequest.accountEmail,
    reason,
  });

  return "Ok";
};
