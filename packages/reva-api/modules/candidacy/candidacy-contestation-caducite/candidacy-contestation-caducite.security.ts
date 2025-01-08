import {
  defaultSecurity,
  isAdminOrCertificationAuthority,
  isOwnerOfCandidacy,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": defaultSecurity,

  "Mutation.*": defaultSecurity,

  "Mutation.candidacy_contestation_caducite_create_contestation":
    isOwnerOfCandidacy,
  "Mutation.candidacy_contestation_caducite_update_certification_authority_contestation_decision":
    isAdminOrCertificationAuthority,
};
