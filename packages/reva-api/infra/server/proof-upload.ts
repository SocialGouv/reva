import fastifyMultipart from "@fastify/multipart";
// import Ajv from "ajv";
import { FastifyPlugin } from "fastify";

import { addPaymentProof } from "../../domain/features/addPaymentProof";
import { FunctionalCodeError } from "../../domain/types/functionalError";
import { getAccountFromKeycloakId } from "../database/postgres/accounts";
import { getCandidacyFromId } from "../database/postgres/candidacies";
import { addFileToUploadSpooler } from "../database/postgres/fileUploadSpooler";
import { getFundingRequest } from "../database/postgres/fundingRequests";
import { getPaymentRequestByCandidacyId } from "../database/postgres/paymentRequest";

const uploadRoute: FastifyPlugin = (server, opts: unknown, done) => {
  server.register(fastifyMultipart, {
    addToBody: true,
  });

  //   const ajv = new Ajv({
  //     useDefaults: true,
  //     coerceTypes: true,
  //     $data: true,
  //     // extendRefs: true,
  //     ignoreKeywordsWithRef: true,
  //   });

  //   ajv.addKeyword({
  //     keyword: "isFileType",
  //     compile: (_schema, parent, _it) => {
  //       parent.type = "file";
  //       delete parent.isFileType;
  //       return () => true;
  //     },
  //   });

  server.post("/payment-request/proof", {
    schema: {
      body: {
        type: "object",
        properties: {
          candidacyId: { type: "string" },
          // document: { isFileType: true },
          // TODO : custom validator with file type and max size
        //   invoice: { type: "file" },
        //   appointment: { type: "object" },
        },
        required: ["candidacyId"],
      },
    },
    handler: async (request: any, reply) => {
      // TODO: Check file type and size
      const result = await addPaymentProof(
        {
          getAccountFromKeycloakId,
          hasRole: request.auth.hasRole,
          getCandidacyFromId,
          addFileToUploadSpooler,
          getPaymentRequestByCandidacyId,
          getFundingRequestFromCandidacyId: getFundingRequest,
        },
        {
          keycloakId: request.auth?.userInfo?.sub,
          candidacyId: request.body.candidacyId,
          appointment: request.body.appointment,
          invoice: request.body.invoice,
        }
      );

      if (result.isLeft()) {
        const err = result.extract();
        reply.code(
          err.code === FunctionalCodeError.TECHNICAL_ERROR ? 500 : 400
        );
        reply.send(err.message);
      } else {
        reply.send("OK");
      }
    },
  });

  done();
};

export default uploadRoute;
