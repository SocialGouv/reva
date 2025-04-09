import { prismaClient } from "../../../prisma/client";
import {
  sendCandidacyTransferToNewCertificationAuthorityEmail,
  sendCandidacyTransferToPreviousCertificationAuthorityEmail,
  sendCandidacyTransferedToOrganismEmail,
  sendCandidacyTransferToCandidate,
} from "../emails";

export const transferCandidacyToCertificationAuthorityLocalAccount =
  async (params: {
    candidacyId: string;
    certificationAuthorityLocalAccountId: string;
    transferReason: string;
    keycloakId?: string;
  }) => {
    const {
      candidacyId,
      certificationAuthorityLocalAccountId,
      transferReason,
      keycloakId,
    } = params;

    const candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        organism: true,
        candidate: true,
        Feasibility: {
          where: { isActive: true },
          include: { certificationAuthority: true },
        },
      },
    });

    if (!candidacy) {
      throw new Error("Candidature non trouvée");
    }

    if (!candidacy.candidate?.departmentId) {
      throw new Error(
        "Le candidat associé à la candidature n'est pas rattaché à un département",
      );
    }

    if (!candidacy.certificationId) {
      throw new Error("La candidature n'est pas associée à une certification");
    }

    const feasibility = candidacy.Feasibility[0];

    if (!feasibility) {
      throw new Error(
        "La candidature n'a pas de dossier de faisabilité en cours",
      );
    }

    if (!feasibility.certificationAuthorityId) {
      throw new Error(
        "Le dossier de faisabilité n'est pas relié à une autorité de certification",
      );
    }

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findUnique({
        where: {
          id: certificationAuthorityLocalAccountId,
        },
        include: {
          account: true,
        },
      });
    if (!certificationAuthorityLocalAccount) {
      throw new Error("Compte local de l'autorité de certification non trouvé");
    }

    if (
      certificationAuthorityLocalAccount.certificationAuthorityId !=
      feasibility.certificationAuthorityId
    ) {
      throw new Error(
        "Le compte local n'appartient pas à l'authorité de certification associée au dossier de faisabilité de la candidature",
      );
    }

    await prismaClient.candidacy.update({
      where: {
        id: candidacyId,
      },
      data: {
        certificationAuthorityTransferReason: transferReason,
      },
    });

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.deleteMany(
      { where: { candidacyId } },
    );

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.create({
      data: {
        candidacyId,
        certificationAuthorityLocalAccountId,
      },
    });

    const previousCertificationAuthority = feasibility.certificationAuthority;
    let previousCertificationAuthorityName =
      previousCertificationAuthority?.contactFullName ??
      (previousCertificationAuthority?.label as string);

    const candidateName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;

    const { firstname, lastname } = certificationAuthorityLocalAccount.account;

    let newCertificationAuthorityName = lastname || "";
    if (firstname) {
      newCertificationAuthorityName = newCertificationAuthorityName
        ? `${newCertificationAuthorityName} ${firstname}`
        : newCertificationAuthorityName;
    }

    const organismEmail =
      candidacy.organism?.emailContact ??
      candidacy.organism?.contactAdministrativeEmail;
    const organismName = (candidacy.organism?.nomPublic ??
      candidacy.organism?.label) as string;

    if (keycloakId) {
      const account = await prismaClient.account.findUnique({
        where: { keycloakId },
        include: {
          certificationAuthorityLocalAccount: true,
        },
      });

      const previousCertificationAuthorityLocalAccount =
        account?.certificationAuthorityLocalAccount?.[0];

      if (previousCertificationAuthorityLocalAccount) {
        previousCertificationAuthorityName = account.lastname || "";

        if (account.firstname) {
          previousCertificationAuthorityName =
            previousCertificationAuthorityName
              ? `${previousCertificationAuthorityName} ${account.firstname}`
              : previousCertificationAuthorityName;
        }

        sendCandidacyTransferToPreviousCertificationAuthorityEmail({
          email: account.email,
          previousCertificationAuthorityName,
          newCertificationAuthorityName,
          candidateName,
        });
      } else if (previousCertificationAuthority?.contactEmail) {
        sendCandidacyTransferToPreviousCertificationAuthorityEmail({
          email: previousCertificationAuthority.contactEmail,
          previousCertificationAuthorityName,
          newCertificationAuthorityName,
          candidateName,
        });
      }
    }

    sendCandidacyTransferToNewCertificationAuthorityEmail({
      email: certificationAuthorityLocalAccount.account.email,
      previousCertificationAuthorityName,
      candidateName,
      newCertificationAuthorityName,
      transferReason,
      candidacyId,
    });

    if (candidacy.candidate?.email) {
      sendCandidacyTransferToCandidate({
        email: candidacy.candidate?.email,
        newCertificationAuthorityName,
      });
    }

    if (organismEmail) {
      sendCandidacyTransferedToOrganismEmail({
        email: organismEmail,
        organismName,
        candidateName,
        certificationAuthorityName: newCertificationAuthorityName,
      });
    }
  };
