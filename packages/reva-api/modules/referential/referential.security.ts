import { hasRole } from "../shared/security/middlewares";
import { defaultSecurity } from "../shared/security/presets";

export const referentialResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  "Query.searchCertificationsForAdmin": [hasRole(["admin"])],

  "Mutation.referential_updateCertification": [hasRole(["admin"])],
  "Mutation.referential_replaceCertification": [hasRole(["admin"])],
  "Mutation.referential_updateCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],
};
