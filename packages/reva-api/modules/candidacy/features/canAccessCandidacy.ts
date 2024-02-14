import { prismaClient } from "../../../prisma/client";

export const canAccessCandidacy = async ({
  candidacyId,
  keycloakId,
  roles,
}: {
  candidacyId: string;
  keycloakId: string;
  roles: KeyCloakUserRole[];
}) => {
  //user is admin
  if (roles.includes("admin")) {
    return true;
  }

  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: { certificationsAndRegions: { where: { isActive: true } } },
  });

  if (!candidacy) {
    return false;
  }

  //user is candidate
  if (roles.length === 0) {
    const candidate = await prismaClient.candidate.findFirst({
      where: { keycloakId },
    });
    if (!candidate) {
      return false;
    }

    return candidacy?.candidateId === candidate?.id;
  }

  const account = await prismaClient.account.findFirst({
    where: { keycloakId },
  });
  if (!account) {
    return false;
  }

  //user is maison mere manager
  if (roles.includes("gestion_maison_mere_aap")) {
    if (!candidacy.organismId) {
      return false;
    }

    const candidacyOrganism = await prismaClient.organism.findFirst({
      where: { id: candidacy.organismId },
    });

    if (!candidacyOrganism) {
      return false;
    }

    const maisonMere = await prismaClient.maisonMereAAP.findFirst({
      where: { gestionnaireAccountId: account.id },
    });

    if (!maisonMere) {
      return false;
    }

    return candidacyOrganism?.maisonMereAAPId === maisonMere?.id;
  }

  //user is aap
  if (roles.includes("manage_candidacy")) {
    if (!candidacy.organismId) {
      return false;
    }

    const candidacyOrganism = await prismaClient.organism.findFirst({
      where: { id: candidacy.organismId },
    });

    return candidacyOrganism?.id === account.organismId;
  }

  //user is certification authority admin
  if (roles.includes("manage_certification_authority_local_account")) {
    const candidacyFeasibility = await prismaClient.feasibility.findFirst({
      where: { candidacyId: candidacy.id },
    });

    if (!candidacyFeasibility) {
      return false;
    }

    return (
      candidacyFeasibility.certificationAuthorityId ===
      account.certificationAuthorityId
    );
  }

  //user is certification authority local account owner
  if (roles.includes("manage_feasibility")) {
    const candidacyFeasibility = await prismaClient.feasibility.findFirst({
      where: { candidacyId: candidacy.id },
    });

    if (!candidacyFeasibility) {
      return false;
    }

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findFirst({
        where: { accountId: account.id },
        include: {
          certificationAuthorityLocalAccountOnCertification: true,
          certificationAuthorityLocalAccountOnDepartment: true,
        },
      });

    if (!certificationAuthorityLocalAccount) {
      return false;
    }

    const candidacyCertificationId =
      candidacy.certificationsAndRegions[0].certificationId;

    const candidacyDepartmentId = candidacy.departmentId;

    const candidacyCertificationAuthorityId =
      candidacyFeasibility.certificationAuthorityId;

    const matchCertificationAuthority =
      certificationAuthorityLocalAccount?.certificationAuthorityId ===
      candidacyCertificationAuthorityId;

    const matchCertification =
      certificationAuthorityLocalAccount.certificationAuthorityLocalAccountOnCertification.some(
        (c) => c.certificationId === candidacyCertificationId,
      );
    const matchDepartment =
      certificationAuthorityLocalAccount.certificationAuthorityLocalAccountOnDepartment.some(
        (d) => d.departmentId === candidacyDepartmentId,
      );

    return matchCertificationAuthority && matchCertification && matchDepartment;
  }

  return false;
};
