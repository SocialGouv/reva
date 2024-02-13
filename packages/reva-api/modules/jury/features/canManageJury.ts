import { FeasibilityStatus } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";

export const canManageJury = async ({
  candidacyId,
  roles,
  keycloakId,
}: {
  candidacyId: string;
  roles: string[];
  keycloakId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      candidacyDropOut: true,
      candidacyStatuses: { where: { isActive: true } },
      Feasibility: {
        where: { isActive: true },
      },
    },
  });

  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  if (candidacy.candidacyDropOut) {
    throw new Error("La candidature a été abandonnée");
  }

  if (candidacy.candidacyStatuses?.[0]?.status === "ARCHIVE") {
    throw new Error("La candidature a été supprimée");
  }

  const feasibility = candidacy.Feasibility[0];
  if (!feasibility) {
    throw new Error("Le dossier de faisabilité n'a pas été trouvé");
  }

  if (feasibility.decision !== FeasibilityStatus.ADMISSIBLE) {
    throw new Error("Le dossier de faisabilité n'est pas recevable");
  }

  const certificationAuthorityId = feasibility.certificationAuthorityId;

  // admin
  if (roles.includes("admin")) {
    return true;
  }

  // certification authority
  if (!roles.includes("manage_feasibility")) {
    return false;
  }

  // certification authority admin account
  if (roles.includes("manage_certification_authority_local_account")) {
    // is user account attached to a certification authority which manage the candidacy certification
    const authorized = !!(await prismaClient.account.findFirst({
      where: {
        keycloakId,
        certificationAuthorityId,
      },
      select: { id: true },
    }));

    return authorized;
  }

  // certification authority local account
  // check if candidacy department and certification are in the local account access perimeter
  const account = await getAccountByKeycloakId({ keycloakId });
  if (!account) {
    throw new Error("Compte utilisateur non trouvé");
  }

  const certificationAuthorityLocalAccount =
    await getCertificationAuthorityLocalAccountByAccountId({
      accountId: account.id,
    });
  if (!certificationAuthorityLocalAccount) {
    throw new Error("Compte local d'autorité de certification non trouvé");
  }

  if (
    certificationAuthorityLocalAccount.certificationAuthorityId !==
    certificationAuthorityId
  ) {
    return false;
  }

  const departmentIds =
    certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnDepartment.map(
      (calad) => calad.departmentId,
    );

  const certificationIds =
    certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
      (calac) => calac.certificationId,
    );

  const authorized = !!(await prismaClient.candidacy.findFirst({
    where: {
      id: candidacyId,
      departmentId: { in: departmentIds },
      certificationsAndRegions: {
        some: {
          isActive: true,
          certificationId: { in: certificationIds },
        },
      },
    },
  }));

  return authorized;
};
