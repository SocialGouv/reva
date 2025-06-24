import { prismaClient } from "../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
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
    userInfo: CandidacyAuditLogUserInfo;
  }) => {
    const {
      candidacyId,
      certificationAuthorityLocalAccountId,
      transferReason,
      userInfo,
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

    // Vérifier que le compte collaborateur cible est bien rattaché à un gestionnaire de candidatures associé à la structure certificatrice
    let certificationAuthorityIds = [feasibility.certificationAuthorityId];
    const certificationAuthorityStructureRelation =
      await prismaClient.certificationAuthorityOnCertificationAuthorityStructure.findFirst(
        {
          where: {
            certificationAuthorityId: feasibility.certificationAuthorityId,
          },
        },
      );

    if (certificationAuthorityStructureRelation) {
      const certificationAuthorities =
        await prismaClient.certificationAuthorityOnCertificationAuthorityStructure.findMany(
          {
            where: {
              certificationAuthorityStructureId:
                certificationAuthorityStructureRelation.certificationAuthorityStructureId,
            },
          },
        );

      certificationAuthorityIds = certificationAuthorities.map(
        ({ certificationAuthorityId }) => certificationAuthorityId,
      );
    }

    if (
      !certificationAuthorityIds.includes(
        certificationAuthorityLocalAccount.certificationAuthorityId,
      )
    ) {
      throw new Error(
        "Le compte local n'appartient pas à aucun des gestionnaires de candidatures associés à l'autorité de certification",
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

    await prismaClient.feasibility.update({
      where: {
        id: feasibility.id,
      },
      data: {
        certificationAuthority: {
          connect: {
            id: certificationAuthorityLocalAccount.certificationAuthorityId,
          },
        },
      },
    });

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.deleteMany(
      { where: { candidacyId } },
    );

    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.create({
      data: {
        candidacyId,
        certificationAuthorityLocalAccountId,
        hasBeenTransfered: true,
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

    await logCandidacyAuditEvent({
      candidacyId,
      eventType:
        "CANDIDACY_TRANSFERRED_TO_CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT",
      details: {
        certificationAuthorityLocalAccountId,
        certificationAuthorityLocalAccountAccountEmail:
          certificationAuthorityLocalAccount.account.email,
      },
      ...userInfo,
    });

    if (userInfo.userKeycloakId) {
      const account = await prismaClient.account.findUnique({
        where: { keycloakId: userInfo.userKeycloakId },
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

        await sendCandidacyTransferToPreviousCertificationAuthorityEmail({
          email: account.email,
          previousCertificationAuthorityName,
          newCertificationAuthorityName,
          candidateName,
        });
      } else if (previousCertificationAuthority?.contactEmail) {
        await sendCandidacyTransferToPreviousCertificationAuthorityEmail({
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
      await sendCandidacyTransferToCandidate({
        email: candidacy.candidate?.email,
        newCertificationAuthorityName,
      });
    }

    if (organismEmail) {
      await sendCandidacyTransferedToOrganismEmail({
        email: organismEmail,
        organismName,
        candidateName,
        certificationAuthorityName: newCertificationAuthorityName,
      });
    }
  };
