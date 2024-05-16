import { prismaClient } from "../../../prisma/client";
import {
  sendCandidacyTransferToNewCertificationAuthorityEmail,
  sendCandidacyTransferedToOrganismEmail,
} from "../emails";

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
      candidate: true,
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

  const previousCertificationAuthority =
    candidacyActiveFeasibility?.certificationAuthority;

  const organismEmail =
    candidacy.organism?.organismInformationsCommerciales?.emailContact ??
    candidacy.organism?.contactAdministrativeEmail;
  const organismName =
    candidacy.organism?.organismInformationsCommerciales?.nom ??
    (candidacy.organism?.label as string);
  const previousCertificationAuthorityName =
    previousCertificationAuthority?.contactFullName ??
    (previousCertificationAuthority?.label as string);

  const newCertificationAuthorityName =
    newCertificationAuthority.contactFullName ??
    newCertificationAuthority.label;

  //SEND MAIL PREVIOUS previousCertificationAuthority
  if (newCertificationAuthority.contactEmail) {
    sendCandidacyTransferToNewCertificationAuthorityEmail({
      email: newCertificationAuthority.contactEmail,
      previousCertificationAuthorityName,
      newCertificationAuthorityName,
      candidateName: `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`,
      transferReason,
      candidacyId,
    });
  }
  if (organismEmail) {
    sendCandidacyTransferedToOrganismEmail({
      email: organismEmail,
      organismName,
      candidateName: `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`,
      certificationAuthorityName: newCertificationAuthorityName,
    });
  }

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
