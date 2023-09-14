import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { logger } from "../shared/logger";
import {
  UploadedFile,
  canDownloadFeasibilityFiles,
  canUserManageCandidacy,
  createFeasibility,
  getActiveFeasibilityByCandidacyid,
  getFileWithContent,
  handleFeasibilityDecision,
} from "./feasibility.features";

interface UploadFeasibilityFileRequestBody {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: UploadedFile[];
  documentaryProofFile?: UploadedFile[];
  certificateOfAttendanceFile?: UploadedFile[];
}

export const feasibilityFileUploadRoute: FastifyPluginAsync = async (
  server
) => {
  const maxUploadFileSizeInBytes = 15728640;
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

        const feasibility = await getActiveFeasibilityByCandidacyid({
          candidacyId,
        });

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
            .header("Content-Disposition", "inline")
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
        feasibilityFile.data?.byteLength > maxUploadFileSizeInBytes ||
        (documentaryProofFile?.data?.byteLength ?? 0) >
          maxUploadFileSizeInBytes ||
        (certificateOfAttendanceFile?.data?.byteLength ?? 0) >
          maxUploadFileSizeInBytes
      ) {
        return reply
          .status(400)
          .send(
            `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
              maxUploadFileSizeInBytes / 1024 / 1024
            )} Mo.`
          );
      }
      try {
        await createFeasibility({
          candidacyId: request.body.candidacyId,
          certificationAuthorityId: request.body.certificationAuthorityId,
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

  server.post<{
    Params: { feasibilityId: string };
    Body: {
      comment: string;
      decision: string;
      infoFile?: UploadedFile[];
    };
  }>("/feasibility/:feasibilityId/decision", {
    schema: {
      params: {
        type: "object",
        properties: {
          feasibilityId: { type: "string" },
        },
        required: ["feasibilityId"],
      },
      body: {
        type: "object",
        properties: {
          decision: { type: "string" },
          comment: { type: "string" },
          infoFile: { type: "array", items: { type: "object" } },
        },
      },
    },
    handler: async (request, reply) => {
      const { feasibilityId } = request.params;
      const infoFile = request?.body?.infoFile?.[0];
      if (infoFile) {
        if (!hasValidMimeType(infoFile)) {
          return reply
            .status(400)
            .send(
              `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`
            );
        }

        if (infoFile.data?.byteLength > maxUploadFileSizeInBytes) {
          return reply
            .status(400)
            .send(
              `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
                maxUploadFileSizeInBytes / 1024 / 1024
              )} Mo.`
            );
        }
      }

      return handleFeasibilityDecision({
        feasibilityId,
        decision: request.body.decision,
        hasRole: request.auth.hasRole as (role: string) => boolean,
        keycloakId: request.auth?.userInfo?.sub,
        comment: request.body.comment,
        infoFile,
      });
    },
  });

  const hasValidMimeType = (file?: UploadedFile): boolean => {
    if (!file) {
      return true;
    }
    return validMimeTypes.includes(file.mimetype);
  };
};
