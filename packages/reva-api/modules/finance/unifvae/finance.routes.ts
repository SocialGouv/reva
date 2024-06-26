import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canManageCandidacy } from "../../candidacy/features/canManageCandidacy";
import { UploadedFile } from "../../shared/file";
import { addUploadedFileAndConfirmPayment } from "./features/finance.unifvae.features";

interface PaymentRequestProofBody {
  candidacyId: { value: string };
  invoice: UploadedFile;
  certificateOfAttendance: UploadedFile;
  contractorInvoice1?: UploadedFile;
  contractorInvoice2?: UploadedFile;
  contractorInvoice3?: UploadedFile;
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
          contractorInvoice1: { type: "object" },
          contractorInvoice2: { type: "object" },
          contractorInvoice3: { type: "object" },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request, reply) => {
      const candidacyId = request.body.candidacyId.value;
      const certificateOfAttendanceFile = request.body.certificateOfAttendance;
      const invoiceFile = request.body.invoice;
      const contractorInvoice1 = request.body.contractorInvoice1;
      const contractorInvoice2 = request.body.contractorInvoice2;
      const contractorInvoice3 = request.body.contractorInvoice3;

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
        !hasValidMimeType(invoiceFile) ||
        !hasValidMimeType(contractorInvoice1) ||
        !hasValidMimeType(contractorInvoice2) ||
        !hasValidMimeType(contractorInvoice3)
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
        invoiceFile._buf?.byteLength > maxUploadFileSizeInBytes ||
        (contractorInvoice1?._buf?.byteLength || -1) >
          maxUploadFileSizeInBytes ||
        (contractorInvoice2?._buf?.byteLength || -1) >
          maxUploadFileSizeInBytes ||
        (contractorInvoice3?._buf?.byteLength || -1) > maxUploadFileSizeInBytes
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
        contractorInvoice1,
        contractorInvoice2,
        contractorInvoice3,
        certificateOfAttendanceFile,
        userKeycloakId: request.auth?.userInfo?.sub,
        userEmail: request.auth?.userInfo?.email,
        userRoles: request.auth.userInfo?.realm_access?.roles || [],
      });

      reply.send("OK");
    },
  });

  const hasValidMimeType = (file?: UploadedFile): boolean =>
    file ? validMimeTypeList.includes(file.mimetype) : true;
};

export default uploadRoute;
