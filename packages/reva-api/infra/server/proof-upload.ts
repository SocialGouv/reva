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
            invoice: { type: "array", "items": { "type": "object"} },
            appointment: { type: "array", "items": { "type": "object"} },
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

      const result = await addPaymentProof(
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
};

export default uploadRoute;
