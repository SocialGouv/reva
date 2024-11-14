import { FeasibilityStatus } from "@prisma/client";
import { CERTIFICATION_AUTHORITY_STRUCTURES } from "./certifications.fixture";

export const FEASIBILITY_PDF_ADMISSIBLE = {
  decision: FeasibilityStatus.ADMISSIBLE,
  certificationAuthority: {
    create: {
      label: "dummy",
      certificationAuthorityStructureId:
        CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
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
