import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { canManageCandidacy } from "../../candidacy/features/canManageCandidacy";
import { UploadedFile } from "../../shared/file";
import { addFileToUploadSpooler } from "./database/fileUploadSpooler";
import { getFundingRequest } from "./database/fundingRequests";
import { getPaymentRequestByCandidacyId } from "./database/paymentRequest";
import { addPaymentProof } from "./features/addPaymentProof";

interface PaymentRequestProofBody {
  candidacyId: { value: string };
  invoice?: UploadedFile;
  appointment?: UploadedFile;
}

const uploadRoute: FastifyPluginAsync = async (server, _opts: unknown) => {
  const maxUploadFileSize: number = parseInt(
    process.env.UPLOAD_MAX_FILE_SIZE ?? "4194304",
  );
  const validMimeTypes: string =
    process.env.UPLOAD_VALID_MIME_TYPES ??
    "application/pdf,image/png,image/jpeg";
  const validMimeTypeList: string[] = validMimeTypes.split(",");

  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: maxUploadFileSize },
  });

  server.post<{
    Body: PaymentRequestProofBody;
  }>("/payment-request/proof", {
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
      const auhtorization = await canManageCandidacy({
        hasRole: request.auth.hasRole,
        candidacyId: request.body.candidacyId.value,
        keycloakId: request.auth?.userInfo?.sub,
      });
      if (!auhtorization) {
        return reply.status(403).send({
          err: "Vous n'êtes pas autorisé à gérer cette candidature.",
        });
      }

      if (
        !hasValidMimeType(request.body.appointment) ||
        !hasValidMimeType(request.body.invoice)
      ) {
        return reply
          .status(400)
          .send(
            `Ce type de fichier n'est pas pris en charge. Veuillez soumettre un document PDF.`,
          );
      }

      const result = await addPaymentProof(maxUploadFileSize)(
        {
          addFileToUploadSpooler,
          getPaymentRequestByCandidacyId,
          getFundingRequestFromCandidacyId: getFundingRequest,
        },
        {
          candidacyId: request.body.candidacyId.value,
          appointment: request.body.appointment,
          invoice: request.body.invoice,
        },
      );

      if (result.isLeft()) {
        const err = result.extract();
        reply.code(500);
        reply.send(err.message);
      } else {
        reply.send("OK");
      }
    },
  });

  const hasValidMimeType = (file?: UploadedFile): boolean => {
    if (!file) {
      return true;
    }
    return validMimeTypeList.includes(file.mimetype);
  };
};

export default uploadRoute;
