import { FromSchema } from "json-schema-to-ts";

import { Duration } from "../../../../graphql/generated/graphql.js";
import { mapPageInfo } from "../../../../utils/mappers/pageInfo.js";
import { GetGqlResponseType, GetGqlRowType } from "../../../../utils/types.js";
import {
  dossiersDeFaisabiliteResponseSchema,
  pageInfoSchema,
} from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  dossierDeFaisabiliteSchema,
  dureeExperienceSchema,
  experienceSchema,
  fichierSchema,
  statutDossierDeFaisabiliteSchema,
  typeDeDocumentSchemaDossierDeFaisabilite,
} from "../../schemas.js";

import { getFeasibilities } from "./getFeasibilities.js";

type MappedFeasibilitiesResponse = FromSchema<
  typeof dossiersDeFaisabiliteResponseSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof typeDeDocumentSchemaDossierDeFaisabilite,
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
      typeof typeDeDocumentSchemaDossierDeFaisabilite,
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

const typeDeDocumentMapFromGqlToInterop: Record<
  string,
  (typeof typeDeDocumentSchemaDossierDeFaisabilite)["enum"][number]
> = {
  ID_CARD: "PIECE_D_IDENTITE",
  EQUIVALENCE_OR_EXEMPTION_PROOF: "JUSTIFICATIF_D_EQUIVALENCE_OU_DE_DISPENSE",
  TRAINING_CERTIFICATE: "ATTESTATION_OU_CERTIFICAT_DE_FORMATION",
  ADDITIONAL: "PIECE_SUPPLEMENTAIRE",
};

const buildPreviewUrl = (path: string) => {
  if (process.env.ENVIRONMENT === "local") {
    return "http://localhost:8080" + path;
  }
  return process.env.BASE_URL + path;
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

  const documents: {
    type: (typeof typeDeDocumentSchemaDossierDeFaisabilite)["enum"][number];
    fichier: {
      nom: string;
      url: string;
      typeMime: string;
    };
  }[] = [];

  if (feasibilityFormat == "DEMATERIALIZED" && dematerializedFeasibilityFile) {
    const { dffFile, attachments } = dematerializedFeasibilityFile;

    if (dffFile && dffFile.previewUrl) {
      documents.push({
        type: "DOSSIER_DE_FAISABILITE",
        fichier: {
          nom: dffFile.name,
          url: buildPreviewUrl(dffFile.previewUrl),
          typeMime: dffFile.mimeType,
        },
      });
    }

    const filteredAttachment = attachments.filter((a) => a != null);
    for (const attachment of filteredAttachment) {
      const { file, type } = attachment;

      if (file && file.previewUrl) {
        documents.push({
          type: typeDeDocumentMapFromGqlToInterop[type],
          fichier: {
            nom: file.name,
            url: buildPreviewUrl(file.previewUrl),
            typeMime: file.mimeType,
          },
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
        type: "DOSSIER_DE_FAISABILITE",
        fichier: {
          nom: feasibilityFile.name,
          url: buildPreviewUrl(feasibilityFile.previewUrl),
          typeMime: feasibilityFile.mimeType,
        },
      });
    }

    if (IDFile && IDFile.previewUrl) {
      documents.push({
        type: "PIECE_D_IDENTITE",
        fichier: {
          nom: IDFile.name,
          url: buildPreviewUrl(IDFile.previewUrl),
          typeMime: IDFile.mimeType,
        },
      });
    }

    if (documentaryProofFile && documentaryProofFile.previewUrl) {
      documents.push({
        type: "JUSTIFICATIF_D_EQUIVALENCE_OU_DE_DISPENSE",
        fichier: {
          nom: documentaryProofFile.name,
          url: buildPreviewUrl(documentaryProofFile.previewUrl),
          typeMime: documentaryProofFile.mimeType,
        },
      });
    }

    if (certificateOfAttendanceFile && certificateOfAttendanceFile.previewUrl) {
      documents.push({
        type: "ATTESTATION_OU_CERTIFICAT_DE_FORMATION",
        fichier: {
          nom: certificateOfAttendanceFile.name,
          url: buildPreviewUrl(certificateOfAttendanceFile.previewUrl),
          typeMime: certificateOfAttendanceFile.mimeType,
        },
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

export const mapGetFeasibilities = (
  feasibilitiesPage: GetGqlResponseType<typeof getFeasibilities>,
): MappedFeasibilitiesResponse => {
  return {
    data: feasibilitiesPage.rows
      .map(mapFeasibility)
      .filter((f) => typeof f !== "undefined"),
    info: mapPageInfo(feasibilitiesPage.info),
  };
};
