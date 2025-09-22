import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";

export const sendCandidacyDropOutEmailToCertificateur = async (
  candidacyId: string,
) => {
  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    include: {
      certificationAuthority: true,
      candidacy: { include: { candidate: true } },
    },
  });

  if (!feasibility) {
    return;
  }

  const {
    candidacy: { candidate },
  } = feasibility;

  const candidateFullName =
    candidate &&
    `${candidate?.firstname || ""}${
      candidate?.lastname ? ` ${candidate?.lastname}` : ""
    }`;

  const contactEmail = feasibility.certificationAuthority?.contactEmail;

  if (!contactEmail || !candidateFullName) {
    return;
  }

  const feasibilityUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/feasibility`,
  });

  return sendEmailUsingTemplate({
    to: { email: contactEmail },
    templateId: 566,
    params: { candidateFullName, feasibilityUrl },
  });
};
