import { getCertificationAuthority } from "./feasibility.features";

export const feasibilityResolvers = {
  Candidacy: {
    certificationAuthority: (parent: {
      certificationId: string;
      departmentId: string;
    }) => getCertificationAuthority(parent),
  },
};
