import { FromSchema } from "json-schema-to-ts";

import { mapPageInfo } from "../../../../utils/mappers/pageInfo.js";
import { GetGqlResponseType, GetGqlRowType } from "../../../../utils/types.js";
import {
  dossiersDeValidationResponseSchema,
  pageInfoSchema,
} from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  dossierDeValidationSchema,
  fichierSchema,
  statutDossierDeValidationSchema,
  typeDeDocumentDossierDeValidationSchema,
} from "../../schemas.js";

import { getDossiersDeValidation } from "./getDossiersDeValidation.js";

type MappedDossiersDeValidationResponse = FromSchema<
  typeof dossiersDeValidationResponseSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof typeDeDocumentDossierDeValidationSchema,
      typeof fichierSchema,
      typeof dossierDeValidationSchema,
      typeof statutDossierDeValidationSchema,
    ];
  }
>;

type MappedDossierDeValidation = FromSchema<
  typeof dossierDeValidationSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof typeDeDocumentDossierDeValidationSchema,
      typeof fichierSchema,
      typeof statutDossierDeValidationSchema,
    ];
  }
>;

const statusMapFromGqlToInterop: Record<
  string,
  (typeof statutDossierDeValidationSchema)["enum"][number]
> = {
  PENDING: "EN_ATTENTE",
  INCOMPLETE: "SIGNALE",
  COMPLETE: "VERIFIE",
};

const buildPreviewUrl = (path: string) => {
  if (process.env.ENVIRONEMENT === "local") {
    return "http://localhost:8080" + path;
  }
  return process.env.BASE_URL + path;
};

const mapDossierDeValidation = (
  dossierDeValidation: GetGqlRowType<typeof getDossiersDeValidation>,
): MappedDossierDeValidation | undefined => {
  const status = statusMapFromGqlToInterop[dossierDeValidation.decision];

  const documents: {
    type: (typeof typeDeDocumentDossierDeValidationSchema)["enum"][number];
    fichier: {
      nom: string;
      url: string;
      typeMime: string;
    };
  }[] = [];

  const { dossierDeValidationFile, dossierDeValidationOtherFiles } =
    dossierDeValidation;

  if (dossierDeValidationFile && dossierDeValidationFile.previewUrl) {
    documents.push({
      type: "DOSSIER_DE_VALIDATION",
      fichier: {
        nom: dossierDeValidationFile.name,
        url: buildPreviewUrl(dossierDeValidationFile.previewUrl),
        typeMime: dossierDeValidationFile.mimeType,
      },
    });
  }

  for (const dossierDeValidationOtherFile of dossierDeValidationOtherFiles) {
    const file = dossierDeValidationOtherFile;

    if (file && file.previewUrl) {
      documents.push({
        type: "PIECE_SUPPLEMENTAIRE",
        fichier: {
          nom: file.name,
          url: buildPreviewUrl(file.previewUrl),
          typeMime: file.mimeType,
        },
      });
    }
  }

  return {
    candidatureId: dossierDeValidation.candidacy.id,
    dateEnvoi: new Date(
      dossierDeValidation.dossierDeValidationSentAt,
    ).toISOString(),
    statut: status,
    documents,
  };
};

export const mapGetDossiersDeValidation = (
  dossiersDeValidationPage: GetGqlResponseType<typeof getDossiersDeValidation>,
): MappedDossiersDeValidationResponse => {
  return {
    data: dossiersDeValidationPage.rows
      .map(mapDossierDeValidation)
      .filter((f) => typeof f !== "undefined"),
    info: mapPageInfo(dossiersDeValidationPage.info),
  };
};
