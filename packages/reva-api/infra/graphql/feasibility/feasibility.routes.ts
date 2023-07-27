import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canManageCandidacy } from "../../../domain/features/canManageCandidacy";
import { getAccountFromKeycloakId } from "../../database/postgres/accounts";
import { getCandidacyFromId } from "../../database/postgres/candidacies";
import { logger } from "../../logger";
import {
  UploadedFile,
  createFeasibility,
  getFeasibilityByCandidacyid,
  getFileWithContent,
} from "./feasibility.features";

interface UploadFeasibilityFileRequestBody {
  candidacyId: string;
  feasibilityFile: UploadedFile[];
  otherFile?: UploadedFile[];
}

export const feasibilityFileUploadRoute: FastifyPluginAsync = async (
  server
) => {
  const maxUploadFileSizeInKiloBytes = 15000000;
  const validMimeTypes = ["application/pdf"];

  server.register(fastifyMultipart, {
    addToBody: true,
  });

  server.get<{ Params: { candidacyId: string; fileId: string } }>(
    "/candidacy/:candidacyId/feasibility/file/:fileId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            feasibilityId: { type: "string" },
            fileId: { type: "string" },
          },
          required: ["candidacyId", "fileId"],
        },
      },
      handler: async (request, reply) => {
        const { candidacyId, fileId } = request.params;

        const feasibility = await getFeasibilityByCandidacyid({ candidacyId });

        if (
          ![feasibility?.feasibilityFileId, feasibility?.otherFileId].includes(
            fileId
          )
        ) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à visualiser ce fichier.",
          });
        }

        const file = await getFileWithContent({ fileId });

        if (file) {
          reply
            .header("Content-Disposition", "inline; filename=" + file.name)
            .header("Content-Length", file.content.length)
            .type(file.mimeType)
            .send(file.content);
        } else {
          reply.status(400).send("Fichier non trouvé.");
        }
      },
    }
  );

  server.post<{
    Body: UploadFeasibilityFileRequestBody;
  }>("/feasibility/upload-feasibility-file", {
    schema: {
      body: {
        type: "object",
        properties: {
          candidacyId: { type: "string" },
          feasibilityFile: { type: "array", items: { type: "object" } },
          otherFile: { type: "array", items: { type: "object" } },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request, reply) => {
      const auhtorization = await canManageCandidacy(
        {
          hasRole: request.auth.hasRole,
          getAccountFromKeycloakId,
          getCandidacyFromId,
        },
        {
          candidacyId: request.body.candidacyId,
          keycloakId: request.auth?.userInfo?.sub,
        }
      );
      if (auhtorization.isLeft()) {
        return reply.status(500).send({ err: auhtorization.extract() });
      }
      if (auhtorization.extract() === false) {
        return reply.status(403).send({
          err: "Vous n'êtes pas autorisé à gérer cette candidature.",
        });
      }

      const feasibilityFile = request.body.feasibilityFile[0];
      const otherFile = request.body.otherFile?.[0];

      if (!hasValidMimeType(feasibilityFile) || !hasValidMimeType(otherFile)) {
        return reply
          .status(400)
          .send(
            `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`
          );
      }

      if (
        feasibilityFile.data?.byteLength > maxUploadFileSizeInKiloBytes ||
        (otherFile?.data?.byteLength ?? 0) > maxUploadFileSizeInKiloBytes
      ) {
        return reply
          .status(400)
          .send(`La taille du fichier dépasse la taille maximum authorisée`);
      }
      try {
        await createFeasibility({
          candidacyId: request.body.candidacyId,
          feasibilityFile,
          otherFile,
        });
      } catch (e) {
        logger.error(e);
        reply.code(500);
        const message = e instanceof Error ? e.message : "unknown error";
        reply.send(message);
      }
    },
  });

  const hasValidMimeType = (file?: UploadedFile): boolean => {
    if (!file) {
      return true;
    }
    return validMimeTypes.includes(file.mimetype);
  };
};
