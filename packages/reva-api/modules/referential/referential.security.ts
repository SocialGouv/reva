import { hasRole } from "../shared/security/middlewares";
import { defaultSecurity, isAnyone } from "../shared/security/presets";

export const referentialResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  "Query.searchCertificationsForAdmin": [hasRole(["admin"])],

  "Mutation.referential_updateCertification": [hasRole(["admin"])],
  "Mutation.referential_replaceCertification": [hasRole(["admin"])],
  "Mutation.referential_updateCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_createCertificationCompetenceBloc": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_updateCertificationCompetenceBloc": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_addCertification": [hasRole(["admin"])],
  "Mutation.referential_deleteCertificationCompetenceBloc": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_updateCertificationStructureAndCertificationAuthorities":
    [hasRole(["admin"])],
  "Mutation.referential_sendCertificationToRegistryManager": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_resetCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],

  "Query.getEtablissementAsAdmin": [hasRole(["admin"])],
  "Query.getCertificationCompetenceBloc": isAnyone,
};
