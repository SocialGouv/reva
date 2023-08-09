import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { logger } from "../../logger";
import {
  UploadedFile,
  canDownloadFeasibilityFiles,
  canUserManageCandidacy,
  createFeasibility,
  getFeasibilityByCandidacyid,
  getFileWithContent,
} from "./feasibility.features";

interface UploadFeasibilityFileRequestBody {
  candidacyId: string;
  feasibilityFile: UploadedFile[];
  documentaryProofFile?: UploadedFile[];
  certificateOfAttendanceFile?: UploadedFile[];
}

export const feasibilityFileUploadRoute: FastifyPluginAsync = async (
  server
) => {
  const maxUploadFileSizeInKiloBytes = 15000000;
  const validMimeTypes = ["application/pdf"];

  server.register(fastifyMultipart, {
    addToBody: true,
  });

  server.post<{ Params: { candidacyId: string; fileId: string } }>(
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

        const authorized = await canDownloadFeasibilityFiles({
          hasRole: request.auth.hasRole,
          candidacyId,
          keycloakId: request.auth?.userInfo?.sub,
        });

        if (!authorized) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à accéder à ce fichier.",
          });
        }

        const feasibility = await getFeasibilityByCandidacyid({ candidacyId });

        if (
          ![
            feasibility?.feasibilityFileId,
            feasibility?.documentaryProofFileId,
            feasibility?.certificateOfAttendanceFileId,
          ].includes(fileId)
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
          documentaryProofFile: { type: "array", items: { type: "object" } },
          certificateOfAttendanceFile: {
            type: "array",
            items: { type: "object" },
          },
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

      const feasibilityFile = request.body.feasibilityFile[0];
      const documentaryProofFile = request.body.documentaryProofFile?.[0];
      const certificateOfAttendanceFile =
        request.body.certificateOfAttendanceFile?.[0];
      if (
        !hasValidMimeType(feasibilityFile) ||
        !hasValidMimeType(documentaryProofFile) ||
        !hasValidMimeType(certificateOfAttendanceFile)
      ) {
        return reply
          .status(400)
          .send(
            `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`
          );
      }

      if (
        feasibilityFile.data?.byteLength > maxUploadFileSizeInKiloBytes ||
        (documentaryProofFile?.data?.byteLength ?? 0) >
          maxUploadFileSizeInKiloBytes ||
        (certificateOfAttendanceFile?.data?.byteLength ?? 0) >
          maxUploadFileSizeInKiloBytes
      ) {
        return reply
          .status(400)
          .send(`La taille du fichier dépasse la taille maximum authorisée`);
      }
      try {
        await createFeasibility({
          candidacyId: request.body.candidacyId,
          feasibilityFile,
          documentaryProofFile,
          certificateOfAttendanceFile,
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
