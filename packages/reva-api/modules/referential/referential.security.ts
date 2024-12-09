import { isCertificationRegistryManagerOfCertification } from "../certification-authority/security/isCertificationRegistryManagerOfCertification.security";
import { hasRole, whenHasRole } from "../shared/security/middlewares";
import { defaultSecurity, isAnyone } from "../shared/security/presets";

const isAdminOrCertificationRegistryManagerOfCertification = [
  hasRole(["admin", "manage_certification_registry"]),
  whenHasRole(
    "manage_certification_registry",
    isCertificationRegistryManagerOfCertification,
  ),
];

export const referentialResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  "Query.searchCertificationsForAdmin": [hasRole(["admin"])],
  "Query.searchCertificationsV2ForRegistryManager": [
    hasRole(["admin", "manage_certification_registry"]),
  ],
  "Mutation.referential_updateCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_createCertificationCompetenceBloc":
    isAdminOrCertificationRegistryManagerOfCertification,
  "Mutation.referential_updateCertificationCompetenceBloc":
    isAdminOrCertificationRegistryManagerOfCertification,
  "Mutation.referential_addCertification": [hasRole(["admin"])],
  "Mutation.referential_deleteCertificationCompetenceBloc":
    isAdminOrCertificationRegistryManagerOfCertification,
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
