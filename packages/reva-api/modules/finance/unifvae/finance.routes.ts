import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canManageCandidacy } from "../../candidacy/features/canManageCandidacy";
import { UploadedFile } from "../../shared/file";
import { addUploadedFileAndConfirmPayment } from "./features/finance.unifvae.features";

interface PaymentRequestProofBody {
  candidacyId: { value: string };
  invoice: UploadedFile;
  certificateOfAttendance: UploadedFile;
}

const uploadRoute: FastifyPluginAsync = async (server) => {
  const maxUploadFileSizeInBytes: number = parseInt(
    process.env.UPLOAD_MAX_FILE_SIZE ?? "4194304",
  );
  const validMimeTypes: string =
    process.env.UPLOAD_VALID_MIME_TYPES ??
    "application/pdf,image/png,image/jpeg";
  const validMimeTypeList: string[] = validMimeTypes.split(",");

  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: maxUploadFileSizeInBytes },
  });

  server.post<{
    Body: PaymentRequestProofBody;
  }>("/payment-request-unifvae/confirmation", {
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
          invoice: { type: "object" },
          appointment: { type: "object" },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request, reply) => {
      const candidacyId = request.body.candidacyId.value;
      const certificateOfAttendanceFile = request.body.certificateOfAttendance;
      const invoiceFile = request.body.invoice;

      const auhtorization = await canManageCandidacy({
        hasRole: request.auth.hasRole,
        candidacyId,
        keycloakId: request.auth?.userInfo?.sub,
      });

      if (!auhtorization) {
        return reply.status(403).send({
          err: "Vous n'êtes pas autorisé à gérer cette candidature.",
        });
      }

      if (
        !hasValidMimeType(certificateOfAttendanceFile) ||
        !hasValidMimeType(invoiceFile)
      ) {
        return reply
          .status(400)
          .send(
            `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`,
          );
      }

      if (
        certificateOfAttendanceFile._buf?.byteLength >
          maxUploadFileSizeInBytes ||
        invoiceFile._buf?.byteLength > maxUploadFileSizeInBytes
      ) {
        return reply
          .status(400)
          .send(
            `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
              maxUploadFileSizeInBytes / 1024 / 1024,
            )} Mo.`,
          );
      }

      await addUploadedFileAndConfirmPayment({
        candidacyId,
        invoiceFile,
        certificateOfAttendanceFile,
      });

      reply.send("OK");
    },
  });

  const hasValidMimeType = (file: UploadedFile): boolean =>
    validMimeTypeList.includes(file.mimetype);
};

export default uploadRoute;
