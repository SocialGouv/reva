import { Feasibility } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";

export const canManageFeasibility = async ({
  hasRole,
  feasibility,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  feasibility: Feasibility | null;
  keycloakId: string;
}) => {
  if (feasibility == null) {
    throw new Error("Ce dossier est introuvable");
  }

  //admins can manage everything
  if (hasRole("admin")) {
    return true;
  } else if (hasRole("manage_feasibility")) {
    //certification authority admin account
    if (hasRole("manage_certification_authority_local_account")) {
      //is user account attached to a certification authority which manage the candidacy certification ?
      return !!(await prismaClient.account.findFirst({
        where: {
          keycloakId,
          certificationAuthorityId: feasibility.certificationAuthorityId,
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
          "Compte local de l'autorité de certification non trouvé",
        );
      }

      const hasCandidacy =
        await prismaClient.certificationAuthorityLocalAccountOnCandidacy.findUnique(
          {
            where: {
              certificationAuthorityLocalAccountId_candidacyId: {
                candidacyId: feasibility.candidacyId,
                certificationAuthorityLocalAccountId:
                  certificationAuthorityLocalAccount.id,
              },
            },
          },
        );

      return !!hasCandidacy;
    }
  }

  return false;
};
