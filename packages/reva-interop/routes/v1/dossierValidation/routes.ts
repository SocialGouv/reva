import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";

import { dossierDeValidationDecisionInputSchema } from "../inputSchemas.js";
import {
  statutDossierDeValidationSchema,
  candidacyIdSchema,
  dossierDeValidationSchema,
  decisionDossierDeValidationSchema,
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
      }>
    >()
    .route({
      method: "GET",
      url: "/dossiersDeValidation",
      schema: {
        summary: "Récupérer la liste des dossiers de validation",
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Dossier de validation"],
        querystring: {
          type: "object",
          properties: {
            decalage: {
              type: "integer",
              example: 0,
              description: "Décalage pour la pagination",
            },
            limite: {
              type: "integer",
              example: 10,
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof candidacyIdSchema,
            typeof dossierDeValidationSchema,
          ];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId/dossierDeValidation",
      schema: {
        summary: "Récupérer le dernier dossier de validation d'une candidature",
        // security: [{ bearerAuth: [] }],
        tags: ["Non implémenté", "Dossier de validation"],
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
            description: "Détails du dossier de validation",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
          },
        },
      },
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
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
        tags: ["Non implémenté", "Dossier de validation"],
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
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
        tags: ["Non implémenté", "Dossier de validation"],
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
      handler: (_request, response) => {
        return response.status(501).send("Not implemented");
      },
    });
};

export default dossierValidationRoutesApiV1;
