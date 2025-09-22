import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";

export const updateCertificationWithPrerequisitesFromFC = async (params: {
  codeRncp: string;
}) => {
  const { codeRncp } = params;

  const certification = await prismaClient.certification.findFirst({
    where: { rncpId: codeRncp },
  });
  if (!certification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas`,
    );
  }

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas dans le référentiel RNCP`,
    );
  }

  // Update certification from based on RNCP
  await prismaClient.certification.update({
    where: { id: certification.id },
    data: {
      fcPrerequisites: rncpCertification.PREREQUIS.LISTE_PREREQUIS,
      prerequisites: {
        deleteMany: {},
        createMany: {
          data: rncpCertification.PREREQUIS.PARSED_PREREQUIS.map(
            (prerequisite, index) => ({ label: prerequisite, index }),
          ),
        },
      },
    },
  });
};
