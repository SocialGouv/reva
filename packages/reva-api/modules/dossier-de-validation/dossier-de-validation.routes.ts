import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canUserManageCandidacy } from "../feasibility/feasibility.features";
import { UploadedFile } from "../shared/file";
import { logger } from "../shared/logger";
import { sendDossierDeValidation } from "./features/sendDossierDeValidation";

interface UploadDossierDeValidationBody {
  candidacyId: string;
  dossierDeValidationFile: UploadedFile[];
}

type MimeType = "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";

export const dossierDeValidationRoute: FastifyPluginAsync = async (server) => {
  const maxUploadFileSizeInBytes = 15728640;

  server.register(fastifyMultipart, {
    addToBody: true,
  });

  server.post<{
    Body: UploadDossierDeValidationBody;
  }>("/dossier-de-validation/upload-dossier-de-validation", {
    schema: {
      body: {
        type: "object",
        properties: {
          candidacyId: { type: "string" },
          dossierDeValidationFile: { type: "array", items: { type: "object" } },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request, reply) => {
      const authorized = await canUserManageCandidacy({
        hasRole: request.auth.hasRole,
        candidacyId: request.body.candidacyId,
        keycloakId: request.auth?.userInfo?.sub,
      });

      if (!authorized) {
        return reply.status(403).send({
          err: "Vous n'êtes pas autorisé à gérer cette candidature.",
        });
      }

      const dossierDeValidationFile = request.body.dossierDeValidationFile[0];

      if (!hasValidMimeType(dossierDeValidationFile, ["application/pdf"])) {
        return reply
          .status(400)
          .send(
            `Le type de fichier du "dossier de validation" n'est pas pris en charge. Veuillez soumettre un document PDF.`
          );
      }

      if (dossierDeValidationFile.data?.byteLength > maxUploadFileSizeInBytes) {
        return reply
          .status(400)
          .send(
            `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
              maxUploadFileSizeInBytes / 1024 / 1024
            )} Mo.`
          );
      }
      try {
        await sendDossierDeValidation({
          candidacyId: request.body.candidacyId,
          dossierDeValidationFile,
        });
      } catch (e) {
        logger.error(e);
        reply.code(500);
        const message = e instanceof Error ? e.message : "unknown error";
        reply.send(message);
      }
    },
  });

  const hasValidMimeType = (
    file: UploadedFile,
    validMimeTypes: MimeType[]
  ): boolean => {
    return validMimeTypes.includes(file.mimetype as MimeType);
  };
};
