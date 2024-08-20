import {
  defaultSecurity,
  isAdmin,
  isAdminOrCertificationAuthority,
  isAdminOrManager,
  isAnyone,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.*": defaultSecurity, // forbidden
  "Query.*": defaultSecurity, // forbidden

  "Query.certification_authority_getCertificationAuthority": isAdminOrManager,
  "Query.certification_authority_getCertificationAuthorities": isAdmin,
  "Query.certification_authority_getCertificationAuthorityStructures": isAdmin,
  "Query.certification_authority_getCertificationAuthorityStructure": isAdmin,
  "Query.certification_authority_searchCertificationAuthoritiesAndLocalAccounts":
    isAdmin,
  "Query.certification_authority_getCertificationAuthorityLocalAccount":
    isAdmin,
  "Query.certification_authority_getCertificationAuthoritiesToTransferCandidacy":
    isAdminOrCertificationAuthority,

  "Mutation.certification_authority_updateCertificationAuthority": isAnyone, //security handled in resolver
  "Mutation.certification_authority_updateCertificationAuthorityDepartmentsAndCertifications":
    isAdmin,
  "Mutation.certification_authority_createCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_updateCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_deleteCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_transferCandidacyToAnotherCertificationAuthority":
    isAdminOrCertificationAuthority,
  "Mutation.certification_authority_updateCertificationAuthorityStructure":
    isAdmin,
  "Mutation.certification_authority_updateCertificationAuthorityStructureCertifications":
    isAdmin,
};
