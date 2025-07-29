import {
  defaultSecurity,
  isAdminOrGestionnaireOfCommanditaireVaeCollective,
  isAnyone,
} from "@/modules/shared/security/presets";

export const vaeCollectiveResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  // Define specific resolver security rules
  "Query.getCohorteVAECollectiveByCodeInscription": isAnyone,
  "Query.cohortesVaeCollectivesForConnectedAap": isAnyone, // La sécurité est gérée dans la feature (filtre par rapport au rôle de l'utilisateur)
  "Query.vaeCollective_getCommanditaireVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Query.vaeCollective_getCohorteVaeCollectiveById":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_createCohorteVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_updateNomCohorteVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_updateCohorteVAECollectiveOrganism":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_deleteCohorteVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_updateCohorteVAECollectiveCertification":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "CohorteVaeCollective.certificationCohorteVaeCollectives":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,
};
