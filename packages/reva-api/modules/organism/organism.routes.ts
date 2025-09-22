import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { logger } from "@/modules/shared/logger/logger";

import { UploadedFile } from "../shared/file/file.interface";

import { isUserGestionnaireMaisonMereAAPOfMaisonMereAAP } from "./features/isUserGestionnaireMaisonMereAAPOfMaisonMereAAP";
import { submitMaisonMereAAPLegalInformationDocuments } from "./features/submitMaisonMereAAPLegalInformationDocuments";

interface UpdatedMaisonMereAAPLegalInformationRequestBody {
  managerFirstname: { value: string };
  managerLastname: { value: string };
  attestationURSSAF: UploadedFile;
  justificatifIdentiteDirigeant: UploadedFile;
  delegataire?: { value: boolean };
  lettreDeDelegation?: UploadedFile;
  justificatifIdentiteDelegataire?: UploadedFile;
}

type MimeType = "application/pdf" | "image/png" | "image/jpg" | "image/jpeg";

export const organismRoutes: FastifyPluginAsync = async (server) => {
  const maxUploadFileSizeInBytes = 15728640;

  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: maxUploadFileSizeInBytes },
  });

  server.post<{
    Body: UpdatedMaisonMereAAPLegalInformationRequestBody;
    Params: { maisonMereAAPId: string };
  }>("/maisonMereAAP/:maisonMereAAPId/legal-information", {
    schema: {
      body: {
        type: "object",
        properties: {
          managerFirstname: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          managerLastname: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          },
          attestationURSSAF: { type: "object" },
          justificatifIdentiteDirigeant: { type: "object" },
          delegataire: {
            type: "object",
            properties: {
              value: {
                type: "boolean",
              },
            },
          },
          lettreDeDelegation: { type: "object" },
          justificatifIdentiteDelegataire: { type: "object" },
        },
        required: [
          "managerFirstname",
          "managerLastname",
          "attestationURSSAF",
          "justificatifIdentiteDirigeant",
        ],
      },
      params: {
        type: "object",
        properties: {
          maisonMereAAPId: { type: "string" },
        },
        required: ["maisonMereAAPId"],
      },
    },
    handler: async (request, reply) => {
      try {
        const {
          attestationURSSAF,
          justificatifIdentiteDirigeant,
          lettreDeDelegation,
          justificatifIdentiteDelegataire,
        } = request.body;

        const hasRole = request.auth.hasRole;

        const maisonMereAAPId = request.params.maisonMereAAPId;
        const managerFirstname = request.body.managerFirstname.value;
        const managerLastname = request.body.managerLastname.value;
        const delegataire = request.body.delegataire?.value;

        const authorized =
          hasRole("admin") ||
          (await isUserGestionnaireMaisonMereAAPOfMaisonMereAAP({
            maisonMereAAPId,
            userKeycloakId: request.auth.userInfo.sub,
            userRoles: request.auth.userInfo.realm_access?.roles || [],
          }));

        if (!authorized) {
          return reply.status(403).send({
            err: "Vous n'êtes pas autorisé à gérer cette candidature.",
          });
        }

        const files = [
          attestationURSSAF,
          justificatifIdentiteDirigeant,
          lettreDeDelegation,
          justificatifIdentiteDelegataire,
        ];

        if (files.some((f) => f && !hasValidMimeType(f, ["application/pdf"]))) {
          return reply
            .status(400)
            .send(
              `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`,
            );
        }
        if (
          files.some((f) => f && f._buf?.byteLength > maxUploadFileSizeInBytes)
        ) {
          return reply
            .status(400)
            .send(
              `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
                maxUploadFileSizeInBytes / 1024 / 1024,
              )} Mo.`,
            );
        }

        const requiredFiles = delegataire
          ? files
          : [attestationURSSAF, justificatifIdentiteDirigeant];

        if (requiredFiles.some((f) => !f)) {
          return reply
            .status(400)
            .send(`Un des fichiers obligatoire n'a pas été fourni `);
        }
        return submitMaisonMereAAPLegalInformationDocuments({
          maisonMereAAPId,
          managerFirstname,
          managerLastname,
          delegataire: !!delegataire,
          attestationURSSAF,
          justificatifIdentiteDirigeant,
          lettreDeDelegation,
          justificatifIdentiteDelegataire,
        });
      } catch (e) {
        logger.error(e);
        const message = e instanceof Error ? e.message : "unknown error";
        reply.status(500).send(message);
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
