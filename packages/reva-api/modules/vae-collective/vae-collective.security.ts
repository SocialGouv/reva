import {
  defaultSecurity,
  isAdmin,
  isAdminOrGestionnaireOfCommanditaireVaeCollective,
  isAnyone,
  isAdminOrGestionnaireOfCohorteVaeCollective,
} from "@/modules/shared/security/presets";

export const vaeCollectiveResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  // Define specific resolver security rules
  "Query.getCohorteVAECollectiveByCodeInscription": isAnyone,
  "Query.cohortesVaeCollectivesForConnectedAap": isAnyone, // La sécurité est gérée dans la feature (filtre par rapport au rôle de l'utilisateur)
  "Query.vaeCollective_getCommanditaireVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Query.vaeCollective_getCohorteVaeCollectiveById":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Query.vaeCollective_commanditaireVaeCollectives": isAdmin,

  "Mutation.vaeCollective_createCohorteVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,

  "Mutation.vaeCollective_updateNomCohorteVaeCollective":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Mutation.vaeCollective_updateCohorteVAECollectiveOrganism":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Mutation.vaeCollective_deleteCohorteVaeCollective":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Mutation.vaeCollective_updateCohorteVAECollectiveCertification":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Mutation.vaeCollective_publishCohorteVAECollective":
    isAdminOrGestionnaireOfCohorteVaeCollective,

  "Mutation.vaeCollective_createCommanditaireVaeCollective": isAdmin,

  "CohorteVaeCollective.certificationCohorteVaeCollectives":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,
};
