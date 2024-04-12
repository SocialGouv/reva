import { forbidden } from "../shared/security/middlewares";
import { isAdminOrCandidacyCompanion } from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Mutation.*": forbidden, // forbidden

  "Mutation.dematerialized_feasibility_file_createOrUpdateCertificationInfo":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails":
    isAdminOrCandidacyCompanion,
};
