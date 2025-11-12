import { hasRole, whenHasRole } from "@/modules/shared/security/middlewares";
import { whenHasRoleButNotOthers } from "@/modules/shared/security/middlewares/whenHasRoleButNotOthers";
import { isAdmin } from "@/modules/shared/security/presets";

import { isGestionnaireOfMaisonMereAAP } from "./security/isGestionnaireOfMaisonMereAAP.security";
import { isOwnerOfOrganism } from "./security/isOwnerOfOrganism";
import { isOwnerOrCanManageOrganism } from "./security/isOwnerOrCanManageOrganism.security";

const isAdminOrGestionnaireOfMaisonMereAAP = [
  hasRole(["admin", "gestion_maison_mere_aap"]),
  whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
];

const isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism = [
  hasRole(["admin", "gestion_maison_mere_aap", "manage_candidacy"]),
  whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  whenHasRoleButNotOthers(
    "manage_candidacy",
    ["admin", "gestion_maison_mere_aap"],
    isOwnerOfOrganism,
  ),
];

const isAdminOrGestionnaireVaeCollective = [
  hasRole(["admin", "manage_vae_collective"]),
];

export const resolversSecurityMap = {
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.organism_getMaisonMereAAPById": isAdminOrGestionnaireOfMaisonMereAAP,

  "Query.organism_searchOrganisms": isAdminOrGestionnaireVaeCollective,

  "Mutation.organism_updateMaisonMereIsSignalized": isAdmin,

  "Mutation.organism_acceptCgu": [hasRole(["gestion_maison_mere_aap"])],

  "Mutation.organism_updateMaisonMereAccountSetup":
    isAdminOrGestionnaireOfMaisonMereAAP,
  "Mutation.organism_createAccount": isAdminOrGestionnaireOfMaisonMereAAP,
  "Mutation.organism_updateAccountAndOrganism":
    isAdminOrGestionnaireOfMaisonMereAAP,
  "Mutation.organism_updateMaisonMereLegalInformation": isAdmin,

  "Mutation.organism_updateMaisonMereAAPFinancingMethods":
    isAdminOrGestionnaireOfMaisonMereAAP,

  "Mutation.organism_createOrUpdateRemoteOrganismGeneralInformation":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "Mutation.organism_createOrUpdateOnSiteOrganismGeneralInformation":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "Organism.accounts":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "Organism.maisonMereAAP":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "MaisonMereAAP.gestionnaire":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "MaisonMereAAP.organisms":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "MaisonMereAAP.comptesCollaborateurs":
    isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism,

  "MaisonMereAAP.legalInformationDocuments": isAdmin,

  "MaisonMereAAP.legalInformationDocumentsDecisions":
    isAdminOrGestionnaireOfMaisonMereAAP,

  "MaisonMereAAPLegalInformationDocuments.attestationURSSAFFile":
    isAdminOrGestionnaireOfMaisonMereAAP,
  "MaisonMereAAPLegalInformationDocuments.justificatifIdentiteDirigeantFile":
    isAdminOrGestionnaireOfMaisonMereAAP,
  "MaisonMereAAPLegalInformationDocuments.lettreDeDelegationFile":
    isAdminOrGestionnaireOfMaisonMereAAP,
  "MaisonMereAAPLegalInformationDocuments.justificatifIdentiteDelegataireFile":
    isAdminOrGestionnaireOfMaisonMereAAP,

  "MaisonMereAAPLegalInformationDocumentsDecision.internalComment": isAdmin,

  "Mutation.organism_updateDisponiblePourVaeCollective":
    isOwnerOrCanManageOrganism,
};
