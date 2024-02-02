import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canUserManageCandidacy } from "../feasibility/feasibility.features";
import { FileService, UploadedFile } from "../shared/file";
import { logger } from "../shared/logger";
import { canManageDossierDeValidation } from "./features/canManageDossierDeValidation";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getDossierDeValidationOtherFiles } from "./features/getDossierDeValidationOtherFiles";
import { sendDossierDeValidation } from "./features/sendDossierDeValidation";

interface UploadDossierDeValidationBody {
  candidacyId: { value: string };
  dossierDeValidationFile: UploadedFile;
  dossierDeValidationOtherFiles?: UploadedFile | UploadedFile[];
}

type MimeType = "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";

export const dossierDeValidationRoute: FastifyPluginAsync = async (server) => {
  const maxUploadFileSizeInBytes = 15728640;

  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: maxUploadFileSizeInBytes },
  });

  server.get<{ Params: { candidacyId: string; fileId: string } }>(
    "/candidacy/:candidacyId/dossier-de-validation/file/:fileId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            candidacyId: { type: "string" },
            fileId: { type: "string" },
          },
          required: ["candidacyId", "fileId"],
        },
      },
      handler: async (request, reply) => {
        const { candidacyId, fileId } = request.params;

        const dossierDeValidation =
          await getActiveDossierDeValidationByCandidacyId({
            candidacyId,
          });

        const dossierDeValidationOtherFiles = dossierDeValidation
          ? await getDossierDeValidationOtherFiles({
              dossierDeValidationId: dossierDeValidation.id,
            })
          : [];

        const authorized =
          canUserManageCandidacy ||
          canManageDossierDeValidation({
            keycloakId: request.auth?.userInfo?.sub,
            dossierDeValidationId: dossierDeValidation?.id || "",
            roles: request.auth.userInfo?.realm_access?.roles || [],
          });

        if (!authorized) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à accéder à ce fichier.",
          });
        }

        if (
          ![
            dossierDeValidation?.dossierDeValidationFileId,
            ...dossierDeValidationOtherFiles.map((f) => f.id),
          ].includes(fileId)
        ) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à visualiser ce fichier.",
          });
        }

        const fileLink = await FileService.getInstance().getDownloadLink({
          fileKeyPath: `${candidacyId}/${fileId}`,
        });

        if (fileLink) {
          reply
            .code(200)
            .header("Content-Type", "application/json; charset=utf-8")
            .send({ url: fileLink });

          return;
        }

        reply.status(400).send("Fichier non trouvé.");
      },
    },
  );

  server.post<{
    Body: UploadDossierDeValidationBody;
  }>("/dossier-de-validation/upload-dossier-de-validation", {
    schema: {
      body: {
        type: "object",
        properties: {
          candidacyId: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          dossierDeValidationFile: { type: "object" },
          dossierDeValidationOtherFiles: {
            oneOf: [
              { type: "object" },
              {
                type: "array",
                items: { type: "object" },
              },
            ],
          },
        },
        required: ["candidacyId", "dossierDeValidationFile"],
      },
    },
    handler: async (request, reply) => {
      const authorized = await canUserManageCandidacy({
        hasRole: request.auth.hasRole,
        candidacyId: request.body.candidacyId.value,
        keycloakId: request.auth?.userInfo?.sub,
      });

      if (!authorized) {
        return reply.status(403).send({
          err: "Vous n'êtes pas autorisé à gérer cette candidature.",
        });
      }

      const dossierDeValidationFile = request.body.dossierDeValidationFile;

      let dossierDeValidationOtherFiles: UploadedFile[] = [];
      if (Array.isArray(request.body.dossierDeValidationOtherFiles)) {
        dossierDeValidationOtherFiles = [
          ...request.body.dossierDeValidationOtherFiles,
        ];
      } else if (request.body.dossierDeValidationOtherFiles) {
        dossierDeValidationOtherFiles = [
          request.body.dossierDeValidationOtherFiles,
        ];
      }

      for (const otherFile of [
        dossierDeValidationFile,
        ...dossierDeValidationOtherFiles,
      ]) {
        if (!hasValidMimeType(otherFile, ["application/pdf"])) {
          return reply
            .status(400)
            .send(
              `Le type de fichier du fichier "${otherFile.filename}" n'est pas pris en charge. Veuillez soumettre un document PDF.`,
            );
        }

        if (otherFile._buf?.byteLength > maxUploadFileSizeInBytes) {
          return reply
            .status(400)
            .send(
              `La taille du fichier "${
                otherFile.filename
              }" dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
                maxUploadFileSizeInBytes / 1024 / 1024,
              )} Mo.`,
            );
        }
      }

      try {
        await sendDossierDeValidation({
          candidacyId: request.body.candidacyId.value,
          dossierDeValidationFile,
          dossierDeValidationOtherFiles,
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
    validMimeTypes: MimeType[],
  ): boolean => {
    return validMimeTypes.includes(file.mimetype as MimeType);
  };
};
