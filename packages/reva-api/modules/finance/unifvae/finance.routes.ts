import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canManageCandidacy } from "@/modules/candidacy/features/canManageCandidacy";
import { UploadedFile } from "@/modules/shared/file/file.interface";

import { addUploadedFileAndConfirmPayment } from "./features/finance.unifvae.features";

interface PaymentRequestProofBody {
  candidacyId: { value: string };
  invoice: UploadedFile;
  certificateOfAttendance: UploadedFile;
  contractorInvoices?: UploadedFile[];
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
          contractorInvoices: {
            oneOf: [
              { type: "object" },
              {
                type: "array",
                items: { type: "object" },
              },
            ],
          },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request, reply) => {
      const candidacyId = request.body.candidacyId.value;
      const certificateOfAttendanceFile = request.body.certificateOfAttendance;
      const invoiceFile = request.body.invoice;

      let contractorInvoiceFiles: UploadedFile[] = [];
      if (Array.isArray(request.body.contractorInvoices)) {
        contractorInvoiceFiles = [...request.body.contractorInvoices];
      } else if (request.body.contractorInvoices) {
        contractorInvoiceFiles = [request.body.contractorInvoices];
      }

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

      [
        certificateOfAttendanceFile,
        invoiceFile,
        ...(contractorInvoiceFiles || []),
      ].forEach((f) => {
        if (!hasValidMimeType(f)) {
          return reply
            .status(400)
            .send(
              `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`,
            );
        }
        if (f._buf.byteLength > maxUploadFileSizeInBytes) {
          return reply
            .status(400)
            .send(
              `La taille du fichier dépasse la taille maximum autorisée. Veuillez soumettre un fichier de moins de ${Math.floor(
                maxUploadFileSizeInBytes / 1024 / 1024,
              )} Mo.`,
            );
        }
      });

      await addUploadedFileAndConfirmPayment({
        candidacyId,
        invoiceFile,
        contractorInvoiceFiles,
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
