import { readFileSync } from "fs";
import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";
import fastifySwagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  addSchemas,
  adresseSchema,
  candidacyIdSchema,
  candidatSchema,
  candidatureSchema,
  certificationSchema,
  decisionDossierDeFaisabiliteSchema,
  decisionDossierDeValidationSchema,
  departementSchema,
  diplomeSchema,
  dossierDeFaisabiliteDecisionSchema,
  dossierDeValidationSchema,
  genreSchema,
  organismeSchema,
  resultatJurySchema,
  situationSchema,
  statutDossierDeFaisabiliteSchema,
  statutDossierDeValidationSchema,
  statutJurySchema,
  typologieCandidatSchema,
} from "./schemas.js";
import {
  addInputSchemas,
  dossierDeValidationDecisionInputSchema,
  resultatJuryInputSchema,
  sessionJuryInputSchema,
} from "./inputSchemas.js";
import {
  addResponseSchemas,
  candidatureResponseSchema,
} from "./responseSchemas.js";
import { validateJwt } from "./authMiddleware.js";
import { getCandidacyDetails } from "./features/candidacies/getCandidacyDetails.js";

const logo = readFileSync("./static/fvae_logo.svg");

const routesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: `France VAE Interoperability API (${process.env.NODE_ENV})`,
        description:
          "France VAE's interoperability API to interface with other official entities",
        version: "1.0.0",
      },
      servers: [
        {
          url: `${process.env.BASE_URL}`,
          description: `${process.env.NODE_ENV?.toUpperCase()} server`,
        },
      ],
      tags: [
        {
          name: "Candidature",
          description: "Gestion des candidatures",
        },
        {
          name: "Dossier de faisabilité",
          description: "Gestion des dossiers de faisabilité",
        },
        {
          name: "Dossier de validation",
          description: "Gestion des dossiers de validation",
        },
        {
          name: "Informations jury",
          description: "Gestion de la session et des résultats liés au jury",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "Votre jeton d'authentification doit être placé dans le header 'Authorization: Bearer VOTRE_JWT'.",
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    logo: {
      type: `image/svg+xml`,
      content: Buffer.from(logo),
      href: "/interop/v1/documentation",
    },
    theme: {
      css: [
        {
          filename: "custom.css",
          content:
            ".swagger-ui .topbar { background-color: #fff !important; img { height: 80px } }",
        },
      ],
    },
    indexPrefix: "/interop/v1",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  addSchemas(fastify);
  addInputSchemas(fastify);
  addResponseSchemas(fastify);

  fastify.decorateRequest("graphqlClient");
  fastify.addHook("onRequest", validateJwt);

  // Declare a route

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof candidacyIdSchema];
        };
        SerializerSchemaOptions: {
          references: [
            typeof candidacyIdSchema,
            typeof candidatSchema,
            typeof genreSchema,
            typeof candidatureSchema,
            typeof candidatureResponseSchema,
            typeof certificationSchema,
            typeof situationSchema,
            typeof typologieCandidatSchema,
            typeof adresseSchema,
            typeof diplomeSchema,
            typeof departementSchema,
            typeof organismeSchema,
          ];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/candidatures/:candidatureId",
      schema: {
        summary: "Récupérer les détails d'une candidature",
        security: [{ bearerAuth: [] }],
        tags: ["Candidature"],
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
            description: "Détails de la candidature",
            $ref: "http://vae.gouv.fr/components/schemas/CandidatureResponse",
          },
        },
      },
      handler: async (request, reply) => {
        const r = await getCandidacyDetails(
          request.graphqlClient,
          request.params.candidatureId,
        );
        if (r) {
          reply.send(r);
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
      url: "/candidatures/:candidatureId/dossierDeFaisabilite",
      schema: {
        summary:
          "Récupérer le dernier dossier de faisabilité d'une candidature",
        security: [{ bearerAuth: [] }],
        tags: ["Dossier de faisabilité"],
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
            desciption: "Dossier de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteResponse",
          },
        },
      },
      handler: () => {
        return "OK";
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
      url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
      schema: {
        summary: "Récupérer la liste des décisions du dossier de faisabilité",
        security: [{ bearerAuth: [] }],
        tags: ["Dossier de faisabilité"],
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
            description: "Liste des décisions sur le dossier de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionsResponse",
          },
        },
      },
      handler: () => {
        return "OK";
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof decisionDossierDeFaisabiliteSchema,
            typeof dossierDeFaisabiliteDecisionSchema,
            typeof candidacyIdSchema,
          ];
        };
      }>
    >()
    .route({
      method: "POST",
      url: "/candidatures/:candidatureId/dossierDeFaisabilite/decisions",
      schema: {
        summary: "Créer une nouvelle décision sur le dossier de faisabilité",
        security: [{ bearerAuth: [] }],
        tags: ["Dossier de faisabilité"],
        body: {
          type: "object",
          properties: {
            decision: {
              $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeFaisabilite",
            },
            commentaire: {
              type: "string",
              description: "Motifs de la décision",
              example: "La pièce d'identité n'est pas lisible.",
            },
            document: {
              type: "string",
              format: "binary",
              description: "Le courrier de recevabilité éventuel",
            },
          },
          required: ["decision"],
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
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.body", request.body);
        return "OK";
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof statutDossierDeFaisabiliteSchema];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/dossiersDeFaisabilite",
      schema: {
        summary: "Récupérer la liste des dossiers de faisabilité",
        security: [{ bearerAuth: [] }],
        tags: ["Dossier de faisabilité"],
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
              example: "Alice+Doe",
              description: "Recherche par mots-clés (nom, prénom, email...)",
            },
            statut: {
              $ref: "http://vae.gouv.fr/components/schemas/StatutDossierDeFaisabilite",
              description: "Filtre par statut du dossier de faisabilité",
            },
          },
        },
        response: {
          200: {
            description: "Liste des dossiers de faisabilité",
            $ref: "http://vae.gouv.fr/components/schemas/DossiersDeFaisabiliteResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.query", request.query);
        return "OK";
      },
    });

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
        security: [{ bearerAuth: [] }],
        tags: ["Dossier de validation"],
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
              example: "Alice+Doe",
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
      handler: (request) => {
        console.log("request.query", request.query);
        return "OK";
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
        security: [{ bearerAuth: [] }],
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
            description: "Détails du dossier de validation",
            $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        return "OK";
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
        security: [{ bearerAuth: [] }],
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
      handler: (request) => {
        console.log("request.params", request.params);
        return "OK";
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
        security: [{ bearerAuth: [] }],
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
      handler: (request) => {
        console.log("request.body", request.body);
        console.log("request.params", request.params);
        return "OK";
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof statutJurySchema];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/informationsJury",
      schema: {
        summary: "Récupérer la liste des informations jury",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
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
              example: "Alice+Doe",
              description: "Filtre de recherche",
            },
            statut: {
              $ref: "http://vae.gouv.fr/components/schemas/StatutJury",
              description: "Filtre par statut de jury",
            },
          },
        },
        response: {
          200: {
            description: "Liste des candidats à l'étape jury",
            $ref: "http://vae.gouv.fr/components/schemas/InformationsJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.query", request.query);
        return "OK";
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
      url: "/candidatures/:candidatureId/informationJury",
      schema: {
        summary: "Récupérer les informations du jury d'un candidat",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
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
            description: "Informations du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/InformationJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        return "OK";
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
      url: "/candidatures/:candidatureId/informationJury/session",
      schema: {
        summary:
          "Récupérer les informations de la session du jury pour un candidat",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
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
            description: "Informations de la session du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        return "OK";
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [typeof candidacyIdSchema, typeof sessionJuryInputSchema];
        };
      }>
    >()
    .route({
      method: "PUT",
      url: "/candidatures/:candidatureId/informationJury/session",
      schema: {
        summary:
          "Mettre à jour les informations de la session du jury pour un candidat",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
        body: {
          $ref: "http://vae.gouv.fr/components/schemas/SessionJuryInput",
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
          200: {
            description: "Informations de session mises à jour avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        console.log("request.body", request.body);
        return "OK";
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
      url: "/candidatures/:candidatureId/informationJury/resultat",
      schema: {
        summary: "Récupérer le résultat du jury pour un candidat",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
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
            description: "Résultat du jury du candidat",
            $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        return "OK";
      },
    });

  fastify
    .withTypeProvider<
      JsonSchemaToTsProvider<{
        ValidatorSchemaOptions: {
          references: [
            typeof candidacyIdSchema,
            typeof resultatJuryInputSchema,
            typeof resultatJurySchema,
          ];
        };
      }>
    >()
    .route({
      method: "PUT",
      url: "/candidatures/:candidatureId/informationJury/resultat",
      schema: {
        summary: "Mettre à jour le résultat du jury pour un candidat",
        security: [{ bearerAuth: [] }],
        tags: ["Informations jury"],
        body: {
          $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryInput",
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
          200: {
            description: "Résultat du jury mis à jour avec succès",
            $ref: "http://vae.gouv.fr/components/schemas/ResultatJuryResponse",
          },
        },
      },
      handler: (request) => {
        console.log("request.params", request.params);
        console.log("request.body", request.body);
        return "OK";
      },
    });

  fastify.get("/docs", { schema: { hide: true } }, async (_request, reply) => {
    reply.type("html");
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Documentation API intéropérabilité France VAE</title>
    <!-- needed for adaptive design -->
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <!--
    Redoc doesn't change outer page styles
    -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='${process.env.BASE_URL}/interop/v1/documentation/json' schema-expansion-level="1" json-sample-expand-level="3" hide-schema-titles></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>`;
  });
};

export default routesApiV1;
