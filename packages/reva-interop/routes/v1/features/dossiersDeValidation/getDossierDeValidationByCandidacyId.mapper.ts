import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeValidationResponseSchema } from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  fichierSchema,
  dossierDeValidationSchema,
  statutDossierDeValidationSchema,
} from "../../schemas.js";

import { getDossierDeValidationByCandidacyId } from "./getDossierDeValidationByCandidacyId.js";

type MappedDossierDeValidationResponse = FromSchema<
  typeof dossierDeValidationResponseSchema,
  {
    references: [
      typeof candidacyIdSchema,
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
      typeof candidacyIdSchema,
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
  candidacy: GetGqlResponseType<typeof getDossierDeValidationByCandidacyId>,
): MappedDossierDeValidation | undefined => {
  const { activeDossierDeValidation: dossierDeValidation } = candidacy;

  if (!dossierDeValidation) {
    return undefined;
  }

  const status = statusMapFromGqlToInterop[dossierDeValidation.decision];

  const documents: { nom: string; url: string; typeMime: string }[] = [];

  const { dossierDeValidationFile, dossierDeValidationOtherFiles } =
    dossierDeValidation;

  if (dossierDeValidationFile && dossierDeValidationFile.previewUrl) {
    documents.push({
      nom: dossierDeValidationFile.name,
      url: buildPreviewUrl(dossierDeValidationFile.previewUrl),
      typeMime: dossierDeValidationFile.mimeType,
    });
  }

  for (const dossierDeValidationOtherFile of dossierDeValidationOtherFiles) {
    const file = dossierDeValidationOtherFile;

    if (file && file.previewUrl) {
      documents.push({
        nom: file.name,
        url: buildPreviewUrl(file.previewUrl),
        typeMime: file.mimeType,
      });
    }
  }

  return {
    candidatureId: candidacy.id,
    dateEnvoi: new Date(
      dossierDeValidation.dossierDeValidationSentAt,
    ).toISOString(),
    statut: status,
    documents,
  };
};

export const mapGetDossierDeValidationByCandidacyId = (
  candidacy: GetGqlResponseType<typeof getDossierDeValidationByCandidacyId>,
): MappedDossierDeValidationResponse => {
  return { data: mapDossierDeValidation(candidacy) };
};
