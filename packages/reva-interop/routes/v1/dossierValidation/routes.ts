import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { createDossierDeValidationDecisionByCandidacyId } from "../features/dossiersDeValidation/createDossierDeValidationDecisionByCandidacyId.js";
import { mapCreateDossierDeValidationDecisionByCandidacyId } from "../features/dossiersDeValidation/createDossierDeValidationDecisionByCandidacyId.mapper.js";
import { getDossierDeValidationByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationByCandidacyId.js";
import { mapGetDossierDeValidationByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationByCandidacyId.mapper.js";
import { getDossierDeValidationHistoryByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationHistoryByCandidacyId.js";
import { mapGetDossierDeValidationHistoryByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationHistoryByCandidacyId.mapper.js";
import { getDossiersDeValidation } from "../features/dossiersDeValidation/getDossiersDeValidation.js";
import { mapGetDossiersDeValidation } from "../features/dossiersDeValidation/getDossiersDeValidation.mapper.js";
import { dossierDeValidationDecisionInputSchema } from "../inputSchemas.js";
import {
  dossiersDeValidationResponseSchema,
  pageInfoSchema,
} from "../responseSchemas.js";
import {
  statutDossierDeValidationSchema,
  candidacyIdSchema,
  dossierDeValidationSchema,
  decisionDossierDeValidationSchema,
  fichierSchema,
} from "../schemas.js";

const dossierValidationRoutesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
) => {
  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof statutDossierDeValidationSchema];
        };
        SerializerSchemaOptions: {
          references: [
            typeof dossiersDeValidationResponseSchema,
            typeof pageInfoSchema,
            typeof candidacyIdSchema,
            typeof fichierSchema,
            typeof dossierDeValidationSchema,
            typeof statutDossierDeValidationSchema,
          ];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/dossiersDeValidation",
      schema: {
        summary: "Récupérer la liste des dossiers de validation",
        // security: [{ bearerAuth: [] }],
        tags: ["Dossier de validation"],
        querystring: {
          type: "object",
          properties: {
            decalage: {
              type: "integer",
              example: 0,
              default: 0,
              description: "Décalage pour la pagination",
            },
            limite: {
              type: "integer",
              example: 10,
              default: 10,
              maximum: 100,
              description: "Limite du nombre de résultats",
            },
            recherche: {
              type: "string",
              maxLength: 100,
              example: "Alice Doe",
              description: "Filtre de recherche",
            },
            statut: {
              $ref: "http://vae.gouv.fr/components/schemas/StatutDossierDeValidation",
              description: "Filtre par statut du dossier de validation",
            },
          },
        },
        response: {
          200: {
            description: "Liste des dossiers de validation",
            $ref: "http://vae.gouv.fr/components/schemas/DossiersDeValidationResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { decalage, limite, recherche, statut } = request.query;
        const dossiersDeValidation = await getDossiersDeValidation(
          request.graphqlClient,
          decalage,
          limite,
          statut,
          recherche,
        );
        if (dossiersDeValidation) {
          reply.send(mapGetDossiersDeValidation(dossiersDeValidation));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: { references: [typeof candidacyIdSchema] };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId/dossierDeValidation",
      schema: {
        summary: "Récupérer le dernier dossier de validation d'une candidature",
        // security: [{ bearerAuth: [] }],
        tags: ["Dossier de validation"],
        params: {
          type: "object",
          properties: {
            candidatureId: {
              $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
            },
          },
          required: ["candidatureId"],
        },
        response: {
          200: {
            description: "Dossier de validation",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getDossierDeValidationByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetDossierDeValidationByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof candidacyIdSchema];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId/dossierDeValidation/decisions",
      schema: {
        summary:
          "Récupérer la liste des décisions sur le dossier de validation",
        // security: [{ bearerAuth: [] }],
        tags: ["Dossier de validation"],
        params: {
          type: "object",
          properties: {
            candidatureId: {
              $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
            },
          },
          required: ["candidatureId"],
        },
        response: {
          200: {
            description: "Liste des décisions sur le dossier de validation",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionsResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const candidacy = await getDossierDeValidationHistoryByCandidacyId(
          request.graphqlClient,
          candidatureId,
        );
        if (candidacy) {
          reply.send(mapGetDossierDeValidationHistoryByCandidacyId(candidacy));
        } else {
          reply.status(204).send();
        }
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof candidacyIdSchema,
            typeof dossierDeValidationDecisionInputSchema,
            typeof decisionDossierDeValidationSchema,
          ];
        };
      }>
    >()
    .route({
      method: "POST",
      url: "/candidatures/:candidatureId/dossierDeValidation/decisions",
      schema: {
        summary: "Créer une nouvelle décision sur le dossier de validation",
        // security: [{ bearerAuth: [] }],
        tags: ["Dossier de validation"],
        body: {
          $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionInput",
        },
        params: {
          type: "object",
          properties: {
            candidatureId: {
              $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
            },
          },
          required: ["candidatureId"],
        },
        response: {
          201: {
            description: "Nouvelle décision créée avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const { candidatureId } = request.params;
        const { decision, commentaire } = request.body;

        const candidacy = await createDossierDeValidationDecisionByCandidacyId(
          request.graphqlClient,
          candidatureId,
          {
            decision: decision,
            commentaire: commentaire,
          },
        );

        if (candidacy) {
          reply.send(
            mapCreateDossierDeValidationDecisionByCandidacyId(candidacy),
          );
        } else {
          reply.status(204).send();
        }
      },
    });
};

export default dossierValidationRoutesApiV1;
