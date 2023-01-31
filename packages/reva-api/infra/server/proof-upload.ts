import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";

import { addPaymentProof } from "../../domain/features/addPaymentProof";
import { canManageCandidacy } from "../../domain/features/canManageCandidacy";
import { getAccountFromKeycloakId } from "../database/postgres/accounts";
import { getCandidacyFromId } from "../database/postgres/candidacies";
import { addFileToUploadSpooler } from "../database/postgres/fileUploadSpooler";
import { getFundingRequest } from "../database/postgres/fundingRequests";
import { getPaymentRequestByCandidacyId } from "../database/postgres/paymentRequest";

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
  limit: number;
}

interface PaymentRequestProofBody {
  candidacyId: string;
  invoice?: UploadedFile[];
  appointment?: UploadedFile[];
}

const uploadRoute: FastifyPluginAsync = async (server, _opts: unknown) => {
  const maxUploadFileSize: string =
    process.env.UPLOAD_MAX_FILE_SIZE ?? "4194304";
  const validMimeTypes: string =
    process.env.UPLOAD_VALID_MIME_TYPES ??
    "application/pdf,image/png,image/jpeg";
  const validMimeTypeList: string[] = validMimeTypes.split(",");

  server.register(fastifyMultipart, {
    addToBody: true,
  });

  server.post<{
    Body: PaymentRequestProofBody;
  }>("/payment-request/proof", {
    schema: {
      body: {
        type: "object",
        properties: {
          candidacyId: { type: "string" },
          invoice: { type: "array", items: { type: "object" } },
          appointment: { type: "array", items: { type: "object" } },
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

      if (
        !hasValidMimeType(request.body.appointment) ||
        !hasValidMimeType(request.body.invoice)
      ) {
        return reply.status(400).send(
          `Ce type de fichier n'est pas accepté. Veuillez soumettre une image ou un document.`,
        );
      }

      const result = await addPaymentProof(parseInt(maxUploadFileSize))(
        {
          addFileToUploadSpooler,
          getPaymentRequestByCandidacyId,
          getFundingRequestFromCandidacyId: getFundingRequest,
        },
        {
          candidacyId: request.body.candidacyId,
          appointment: request.body.appointment,
          invoice: request.body.invoice,
        }
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

  const hasValidMimeType = (file?: UploadedFile[]): boolean => {
    if (!file) {
      return true;
    }
    return validMimeTypeList.includes(file[0].mimetype);
  };
};

export default uploadRoute;
