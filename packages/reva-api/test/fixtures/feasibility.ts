import { certificationAuthorityStructureFixtures } from "./certification";
import { FeasibilityStatus } from "@prisma/client";

export const feasibilityAdmissible = {
  decision: FeasibilityStatus.ADMISSIBLE,
  certificationAuthority: {
    create: {
      label: "dummy",
      certificationAuthorityStructureId:
        certificationAuthorityStructureFixtures.UIMM.id,
    },
  },
  feasibilityUploadedPdf: {
    create: {
      feasibilityFile: {
        create: {
          name: "dummyFile.ext",
          mimeType: "pdf",
          path: "dummyFile.ext",
        },
      },
    },
  },
};
