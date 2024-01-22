import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";

export const canManageDossierDeValidation = async ({
  dossierDeValidationId,
  roles,
  keycloakId,
}: {
  dossierDeValidationId: string;
  roles: string[];
  keycloakId: string;
}) => {
  const dossierDeValidation = await prismaClient.dossierDeValidation.findFirst({
    where: { id: dossierDeValidationId },
    include: {
      candidacy: { include: { Feasibility: { where: { isActive: true } } } },
    },
  });

  if (dossierDeValidation == null) {
    throw new Error("Ce dossier est introuvable");
  }

  const certificationAuthorityId =
    dossierDeValidation.candidacy.Feasibility?.[0].certificationAuthorityId;

  //admins can manage everything
  if (roles.includes("admin")) {
    return true;
  } else if (roles.includes("manage_feasibility")) {
    //certification authority admin account
    if (roles.includes("manage_certification_authority_local_account")) {
      //is user account attached to a certification authority which manage the candidacy certification ?
      return !!(await prismaClient.account.findFirst({
        where: {
          keycloakId,
          certificationAuthorityId,
        },
        select: { id: true },
      }));
    }
    //certification authority local account
    //check if candidacy department and certification are in the local account access perimeter
    else {
      const account = await getAccountByKeycloakId({ keycloakId });
      if (!account) {
        throw new Error("Compte utilisateur non trouvé");
      }
      const certificationAuthorityLocalAccount =
        await getCertificationAuthorityLocalAccountByAccountId({
          accountId: account.id,
        });

      if (!certificationAuthorityLocalAccount) {
        throw new Error(
          "Compte local de l'autorité de certification non trouvé"
        );
      }

      if (
        certificationAuthorityLocalAccount.certificationAuthorityId !==
        certificationAuthorityId
      ) {
        throw new Error("Vous n'êtes pas autorisé à consulter ce dossier");
      }

      const departmentIds =
        certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnDepartment.map(
          (calad) => calad.departmentId
        );

      const certificationIds =
        certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
          (calac) => calac.certificationId
        );

      return !!(await prismaClient.dossierDeValidation.findFirst({
        where: {
          id: dossierDeValidationId,
          candidacy: {
            departmentId: { in: departmentIds },
            certificationsAndRegions: {
              some: {
                isActive: true,
                certificationId: { in: certificationIds },
              },
            },
            Feasibility: { some: { isActive: true, certificationAuthorityId } },
          },
        },
      }));
    }
  }

  return false;
};
