import { FromSchema } from "json-schema-to-ts";

import { Duration } from "../../graphql/generated/graphql.js";
import { getFeasibilities } from "../../routes/v1/features/feasibilities/getFeasibilities.js";
import {
  dossiersDeFaisabiliteResponseSchema,
  pageInfoSchema,
} from "../../routes/v1/responseSchemas.js";
import {
  candidacyIdSchema,
  dossierDeFaisabiliteSchema,
  dureeExperienceSchema,
  experienceSchema,
  fichierSchema,
  statutDossierDeFaisabiliteSchema,
} from "../../routes/v1/schemas.js";
import { GetGqlResponseType, GetGqlRowType } from "../types.js";

import { mapPageInfo } from "./pageInfo.js";

type MappedFeasibilitiesResponse = FromSchema<
  typeof dossiersDeFaisabiliteResponseSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof fichierSchema,
      typeof dureeExperienceSchema,
      typeof experienceSchema,
      typeof dossierDeFaisabiliteSchema,
      typeof statutDossierDeFaisabiliteSchema,
    ];
  }
>;

type MappedFeasibility = FromSchema<
  typeof dossierDeFaisabiliteSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof fichierSchema,
      typeof dureeExperienceSchema,
      typeof experienceSchema,
      typeof statutDossierDeFaisabiliteSchema,
    ];
  }
>;

const statusMapFromGqlToInterop: Record<
  string,
  (typeof statutDossierDeFaisabiliteSchema)["enum"][number]
> = {
  PENDING: "EN_ATTENTE",
  REJECTED: "IRRECEVABLE",
  ADMISSIBLE: "RECEVABLE",
  DROPPED_OUT: "ABANDONNE",
  INCOMPLETE: "INCOMPLET",
  COMPLETE: "COMPLET",
  ARCHIVED: "ARCHIVE",
  VAE_COLLECTIVE: "VAE_COLLECTIVE",
};

const expDurationMapFromGqlToInterop: Record<
  Duration,
  (typeof dureeExperienceSchema)["enum"][number]
> = {
  unknown: "INCONNU",
  lessThanOneYear: "MOINS_D_UN_AN",
  betweenOneAndThreeYears: "ENTRE_UN_ET_TROIS_ANS",
  moreThanThreeYears: "PLUS_DE_TROIS_ANS",
  moreThanFiveYears: "PLUS_DE_CINQ_ANS",
  moreThanTenYears: "PLUS_DE_DIX_ANS",
};

const mapFeasibility = (
  feasibility: GetGqlRowType<typeof getFeasibilities>,
): MappedFeasibility | undefined => {
  let status: (typeof statutDossierDeFaisabiliteSchema)["enum"][number];

  if (feasibility.candidacy.status === "ARCHIVE") {
    status = "ARCHIVE";
  } else if (feasibility.candidacy.candidacyDropOut) {
    status = "ABANDONNE";
  } else if (feasibility.decision in statusMapFromGqlToInterop) {
    status = statusMapFromGqlToInterop[feasibility.decision];
  } else {
    return;
  }

  const {
    feasibilityFormat,
    feasibilityUploadedPdf,
    dematerializedFeasibilityFile,
  } = feasibility;

  const documents: { nom: string; url: string; typeMime: string }[] = [];

  if (feasibilityFormat == "DEMATERIALIZED" && dematerializedFeasibilityFile) {
    const { dffFile, attachments } = dematerializedFeasibilityFile;

    if (dffFile && dffFile.previewUrl) {
      documents.push({
        nom: dffFile.name,
        url: dffFile.previewUrl,
        typeMime: dffFile.mimeType,
      });
    }

    const filteredAttachment = attachments.filter((a) => a != null);
    for (const attachment of filteredAttachment) {
      const { file } = attachment;

      if (file && file.previewUrl) {
        documents.push({
          nom: file.name,
          url: file.previewUrl,
          typeMime: file.mimeType,
        });
      }
    }
  } else if (feasibilityFormat == "UPLOADED_PDF" && feasibilityUploadedPdf) {
    const {
      feasibilityFile,
      IDFile,
      documentaryProofFile,
      certificateOfAttendanceFile,
    } = feasibilityUploadedPdf;

    if (feasibilityFile && feasibilityFile.previewUrl) {
      documents.push({
        nom: feasibilityFile.name,
        url: feasibilityFile.previewUrl,
        typeMime: feasibilityFile.mimeType,
      });
    }

    if (IDFile && IDFile.previewUrl) {
      documents.push({
        nom: IDFile.name,
        url: IDFile.previewUrl,
        typeMime: IDFile.mimeType,
      });
    }

    if (documentaryProofFile && documentaryProofFile.previewUrl) {
      documents.push({
        nom: documentaryProofFile.name,
        url: documentaryProofFile.previewUrl,
        typeMime: documentaryProofFile.mimeType,
      });
    }

    if (certificateOfAttendanceFile && certificateOfAttendanceFile.previewUrl) {
      documents.push({
        nom: certificateOfAttendanceFile.name,
        url: certificateOfAttendanceFile.previewUrl,
        typeMime: certificateOfAttendanceFile.mimeType,
      });
    }
  }

  return {
    candidatureId: feasibility.candidacy.id,
    dateEnvoi: feasibility.feasibilityFileSentAt
      ? new Date(feasibility.feasibilityFileSentAt).toISOString()
      : null,
    statut: status,
    experiences: feasibility.candidacy.experiences.map((experience) => ({
      titre: experience.title,
      duree: expDurationMapFromGqlToInterop[experience.duration],
      description: experience.description,
      dateDemarrage: new Date(experience.startedAt).toISOString(),
    })),
    documents,
  };
};

export const mapFeasibilities = (
  feasibilitiesPage: GetGqlResponseType<typeof getFeasibilities>,
): MappedFeasibilitiesResponse => {
  return {
    data: feasibilitiesPage.rows
      .map(mapFeasibility)
      .filter((f) => typeof f !== "undefined"),
    info: mapPageInfo(feasibilitiesPage.info),
  };
};
