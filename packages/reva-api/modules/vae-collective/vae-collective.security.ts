import {
  defaultSecurity,
  isAdminOrGestionnaireOfCommanditaireVaeCollective,
  isAnyone,
} from "../shared/security/presets";

export const vaeCollectiveResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  // Define specific resolver security rules
  "Query.getCohorteVAECollectiveByCodeInscription": isAnyone,
  "Query.cohortesVaeCollectivesForConnectedAap": isAnyone, // La sécurité est gérée dans la feature (filtre par rapport au rôle de l'utilisateur)
  "Query.vaeCollective_getCommanditaireVaeCollective":
    isAdminOrGestionnaireOfCommanditaireVaeCollective,
};
