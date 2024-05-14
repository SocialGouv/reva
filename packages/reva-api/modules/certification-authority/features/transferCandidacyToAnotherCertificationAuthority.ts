import { prismaClient } from "../../../prisma/client";

export const transferCandidacyToAnotherCertificationAuthority = async ({
  candidacyId,
  certificationAuthorityId,
  transferReason,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  transferReason: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: {
      Feasibility: {
        where: {
          isActive: true,
        },
        include: {
          certificationAuthority: true,
        },
      },
      organism: {
        include: {
          organismInformationsCommerciales: true,
        },
      },
    },
  });

  if (!candidacy) {
    throw new Error(`Aucune candidature trouvée avec l'ID : ${candidacyId}`);
  }

  const newCertificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: {
        id: certificationAuthorityId,
      },
    });

  if (!newCertificationAuthority) {
    throw new Error(
      `Aucun certificateur trouvé avec l'ID : ${certificationAuthorityId}`,
    );
  }

  const candidacyActiveFeasibility = candidacy.Feasibility.find(
    (f) => f.isActive,
  );

  const _previousCertificationAuthority =
    candidacyActiveFeasibility?.certificationAuthority;

  const _AapEmail =
    candidacy.organism?.organismInformationsCommerciales?.emailContact ??
    candidacy.organism?.contactAdministrativeEmail;

  //SEND MAIL PREVIOUS previousCertificationAuthority
  //SEND MAIL NEW newCertificationAuthority
  //SEND MAIL AAP

  await prismaClient.candidacy.update({
    where: {
      id: candidacyId,
    },
    data: {
      certificationAuthorityTransferReason: transferReason,
      Feasibility: {
        update: {
          where: {
            id: candidacyActiveFeasibility?.id,
          },
          data: {
            certificationAuthorityId: newCertificationAuthority.id,
          },
        },
      },
    },
  });

  return true;
};
