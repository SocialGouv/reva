import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { getFeatureByKey } from "../feature-flipping/feature-flipping.features";
import { logger } from "../shared/logger";
import {
  canDownloadFeasibilityFiles,
  canUserManageCandidacy,
  createFeasibility,
  getActiveFeasibilityByCandidacyid,
  getFileWithContent,
  handleFeasibilityDecision,
} from "./feasibility.features";
import { FeasibilityFile, UploadedFile } from "./feasibility.file";

interface UploadFeasibilityFileRequestBody {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: UploadedFile[];
  IDFile: UploadedFile[];
  documentaryProofFile?: UploadedFile[];
  certificateOfAttendanceFile?: UploadedFile[];
}

const KEY_FEATURE_STORE_FILE_WITH_S3 = "store-file-with-s3";

type MimeType = "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";

export const feasibilityFileUploadRoute: FastifyPluginAsync = async (
  server
) => {
  const maxUploadFileSizeInBytes = 15728640;

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

        const feasibility = await getActiveFeasibilityByCandidacyid({
          candidacyId,
        });

        const authorized = await canDownloadFeasibilityFiles({
          hasRole: request.auth.hasRole,
          feasibility: feasibility,
          keycloakId: request.auth?.userInfo?.sub,
        });

        if (!authorized) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à accéder à ce fichier.",
          });
        }

        if (
          ![
            feasibility?.feasibilityFileId,
            feasibility?.IDFileId,
            feasibility?.documentaryProofFileId,
            feasibility?.certificateOfAttendanceFileId,
          ].includes(fileId)
        ) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à visualiser ce fichier.",
          });
        }

        const isS3Enabled =
          (await getFeatureByKey(KEY_FEATURE_STORE_FILE_WITH_S3))?.isActive ==
          true;

        if (isS3Enabled) {
          const feasibilityFile = new FeasibilityFile({ candidacyId, fileId });
          const fileLink = await feasibilityFile.getDownloadLink();

          if (fileLink) {
            reply
              .code(200)
              .header("Content-Type", "application/json; charset=utf-8")
              .send({ url: fileLink });

            return;
          }
        }

        const file = await getFileWithContent({ fileId });

        if (file) {
          reply
            .header("Content-Disposition", "inline")
            .header("Content-Length", file.content.length)
            .type(file.mimeType)
            .send(file.content);

          return;
        }

        reply.status(400).send("Fichier non trouvé.");
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
          IDFile: { type: "array", items: { type: "object" } },
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
      const IDFile = request.body.IDFile[0];
      const documentaryProofFile = request.body.documentaryProofFile?.[0];
      const certificateOfAttendanceFile =
        request.body.certificateOfAttendanceFile?.[0];

      if (!hasValidMimeType(feasibilityFile, ["application/pdf"])) {
        return reply
          .status(400)
          .send(
            `Le type de fichier du "dossier de faisabilité" n'est pas pris en charge. Veuillez soumettre un document PDF.`
          );
      }

      if (
        !hasValidMimeType(IDFile, [
          "application/pdf",
          "image/png",
          "image/jpg",
          "image/jpeg",
        ])
      ) {
        return reply
          .status(400)
          .send(
            `Le type de fichier de la "pièce d’identité" n'est pas pris en charge. Veuillez soumettre un document PDF, JPG, JPEG, PNG.`
          );
      }

      if (
        (documentaryProofFile &&
          !hasValidMimeType(documentaryProofFile, ["application/pdf"])) ||
        (certificateOfAttendanceFile &&
          !hasValidMimeType(certificateOfAttendanceFile, ["application/pdf"]))
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
          IDFile,
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
        if (!hasValidMimeType(infoFile, ["application/pdf"])) {
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

  const hasValidMimeType = (
    file: UploadedFile,
    validMimeTypes: MimeType[]
  ): boolean => {
    return validMimeTypes.includes(file.mimetype as MimeType);
  };
};
