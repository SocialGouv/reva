import { FromSchema } from "json-schema-to-ts";

import { Duration } from "../../../../graphql/generated/graphql.js";
import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeFaisabiliteResponseSchema } from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  dossierDeFaisabiliteSchema,
  dureeExperienceSchema,
  experienceSchema,
  fichierSchema,
  statutDossierDeFaisabiliteSchema,
} from "../../schemas.js";

import { getFeasibilityByCandidacyId } from "./getFeasibilityByCandidacyId.js";

type MappedFeasibilityResponse = FromSchema<
  typeof dossierDeFaisabiliteResponseSchema,
  {
    references: [
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

const buildPreviewUrl = (path: string) => {
  if (process.env.ENVIRONEMENT === "local") {
    return "http://localhost:8080" + path;
  }
  return process.env.BASE_URL + path;
};

const mapFeasibility = (
  candidacy: GetGqlResponseType<typeof getFeasibilityByCandidacyId>,
): MappedFeasibility | undefined => {
  const { feasibility } = candidacy;

  if (!feasibility) {
    return undefined;
  }

  let status: (typeof statutDossierDeFaisabiliteSchema)["enum"][number];

  if (candidacy.status === "ARCHIVE") {
    status = "ARCHIVE";
  } else if (candidacy.candidacyDropOut) {
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
        url: buildPreviewUrl(dffFile.previewUrl),
        typeMime: dffFile.mimeType,
      });
    }

    const filteredAttachment = attachments.filter((a) => a != null);
    for (const attachment of filteredAttachment) {
      const { file } = attachment;

      if (file && file.previewUrl) {
        documents.push({
          nom: file.name,
          url: buildPreviewUrl(file.previewUrl),
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
        url: buildPreviewUrl(feasibilityFile.previewUrl),
        typeMime: feasibilityFile.mimeType,
      });
    }

    if (IDFile && IDFile.previewUrl) {
      documents.push({
        nom: IDFile.name,
        url: buildPreviewUrl(IDFile.previewUrl),
        typeMime: IDFile.mimeType,
      });
    }

    if (documentaryProofFile && documentaryProofFile.previewUrl) {
      documents.push({
        nom: documentaryProofFile.name,
        url: buildPreviewUrl(documentaryProofFile.previewUrl),
        typeMime: documentaryProofFile.mimeType,
      });
    }

    if (certificateOfAttendanceFile && certificateOfAttendanceFile.previewUrl) {
      documents.push({
        nom: certificateOfAttendanceFile.name,
        url: buildPreviewUrl(certificateOfAttendanceFile.previewUrl),
        typeMime: certificateOfAttendanceFile.mimeType,
      });
    }
  }

  return {
    candidatureId: candidacy.id,
    dateEnvoi: feasibility.feasibilityFileSentAt
      ? new Date(feasibility.feasibilityFileSentAt).toISOString()
      : null,
    statut: status,
    experiences: candidacy.experiences.map((experience) => ({
      titre: experience.title,
      duree: expDurationMapFromGqlToInterop[experience.duration],
      description: experience.description,
      dateDemarrage: new Date(experience.startedAt).toISOString(),
    })),
    documents,
  };
};

export const mapGetFeasibilityByCandidacyId = (
  candidacy: GetGqlResponseType<typeof getFeasibilityByCandidacyId>,
): MappedFeasibilityResponse => {
  return { data: mapFeasibility(candidacy) };
};
