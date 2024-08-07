import { isGestionnaireOfMaisonMereAAP } from "./security/isGestionnaireOfMaisonMereAAP.security";
import { hasRole, whenHasRole } from "../shared/security/middlewares";
import { isAdmin } from "../shared/security/presets";

export const resolversSecurityMap = {
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "MaisonMereAAPLegalInformationDocuments.attestationURSSAFFile": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
  "MaisonMereAAPLegalInformationDocuments.justificatifIdentiteDirigeantFile": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
  "MaisonMereAAPLegalInformationDocuments.lettreDeDelegationFile": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
  "MaisonMereAAPLegalInformationDocuments.justificatifIdentiteDelegataireFile":
    [
      hasRole(["admin", "gestion_maison_mere_aap"]),
      whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
    ],

  "MaisonMereAAPLegalInformationDocumentsDecision.internalComment": isAdmin,

  "Mutation.organism_acceptCgu": [hasRole(["gestion_maison_mere_aap"])],
  "Mutation.organism_updateMaisonMereAccountSetup": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
  "Mutation.organism_createAccount": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
  "Mutation.organism_updateAccountAndOrganism": [
    hasRole(["admin", "gestion_maison_mere_aap"]),
    whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  ],
};
