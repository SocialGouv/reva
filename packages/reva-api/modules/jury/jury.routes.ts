import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canUserManageCandidacy } from "../feasibility/feasibility.features";
import { FileService, UploadedFile } from "../shared/file";
import { logger } from "../shared/logger";
import { canManageJury } from "./features/canManageJury";
import { getActivejuryByCandidacyId } from "./features/getActiveJuryByCandidacyId";
import { scheduleSessionOfJury } from "./features/scheduleSessionOfJury";
// import { sendDossierDeValidation } from "./features/sendDossierDeValidation";

interface ScheduleSessionOfJuryBody {
  candidacyId: { value: string };
  date: { value: string };
  time?: { value: string };
  address?: { value: string };
  information?: { value: string };
  convocationFile?: UploadedFile;
}

type MimeType = "application/pdf"; // | "image/png" | "image/jpg" | "image/jpeg";

export const juryRoute: FastifyPluginAsync = async (server) => {
  const maxUploadFileSizeInBytes = 15728640;

  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: maxUploadFileSizeInBytes },
  });

  server.get<{ Params: { candidacyId: string; fileId: string } }>(
    "/candidacy/:candidacyId/jury/file/:fileId",
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

        const jury = await getActivejuryByCandidacyId({
          candidacyId,
        });

        const authorized =
          canUserManageCandidacy ||
          canManageJury({
            keycloakId: request.auth?.userInfo?.sub,
            juryId: jury?.id || "",
            roles: request.auth.userInfo?.realm_access?.roles || [],
          });

        if (!authorized) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à accéder à ce fichier.",
          });
        }

        if (![jury?.convocationFileId].includes(fileId)) {
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
    Body: ScheduleSessionOfJuryBody;
  }>("/jury/schedule-session", {
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
          date: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          time: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          address: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          information: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          convocationFile: { type: "object" },
        },
        required: ["candidacyId", "date"],
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

      const convocationFile = request.body.convocationFile;

      const files = convocationFile ? [convocationFile] : [];

      for (const otherFile of files) {
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

      console.log(request.body);

      try {
        await scheduleSessionOfJury({
          candidacyId: request.body.candidacyId.value,
          date: request.body.date.value,
          time: request.body.time?.value,
          address: request.body.address?.value,
          information: request.body.information?.value,
          convocationFile,
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
