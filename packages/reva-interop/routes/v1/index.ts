import { readFileSync } from "fs";

import formBody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  FastifyPluginAsyncJsonSchemaToTs,
  JsonSchemaToTsProvider,
} from "@fastify/type-provider-json-schema-to-ts";
import * as jose from "jose";

import { mapCandidacyObject } from "../../utils/mappers/candidacy.js";
import { mapFeasibilities } from "../../utils/mappers/feasibility.js";

import { validateJwt } from "./authMiddleware.js";
import { generateJwt } from "./features/auth/generateJwt.js";
import { invalidJwt } from "./features/auth/invalideJwt.js";
import { getCandidacyDetails } from "./features/candidacies/getCandidacyDetails.js";
import { getFeasibilities } from "./features/feasibilities/getFeasibilities.js";
import {
  addInputSchemas,
  dossierDeValidationDecisionInputSchema,
  resultatJuryInputSchema,
  sessionJuryInputSchema,
} from "./inputSchemas.js";
import {
  addResponseSchemas,
  dossiersDeFaisabiliteResponseSchema,
  pageInfoSchema,
} from "./responseSchemas.js";
import {
  addSchemas,
  candidacyIdSchema,
  decisionDossierDeFaisabiliteSchema,
  decisionDossierDeValidationSchema,
  dossierDeFaisabiliteDecisionSchema,
  dossierDeFaisabiliteSchema,
  dossierDeValidationSchema,
  dureeExperienceSchema,
  experienceSchema,
  fichierSchema,
  resultatJurySchema,
  statutDossierDeFaisabiliteSchema,
  statutDossierDeValidationSchema,
  statutJurySchema,
} from "./schemas.js";

const logo = readFileSync("./static/fvae_logo.svg");

const routesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {
  const security: Array<{ [key: string]: string[] }> = [
    {
      bearerAuth: [],
    },
  ];
  const securitySchemes: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "Votre jeton d'authentification doit être placé dans le header 'Authorization: Bearer VOTRE_JWT'.",
    },
  };

  if (
    process.env.ENVIRONMENT !== "production" &&
    process.env.ENVIRONMENT !== "sandbox"
  ) {
    security.push({
      oauth: [],
    });
    securitySchemes["oauth"] = {
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_REVA_ADMIN_REALM}/protocol/openid-connect/auth`,
          tokenUrl: "/interop/v1/documentation/openid-connect/token",
          scopes: {
            openid: "openid",
            profile: "profile",
            roles: "roles",
          },
        },
      },
    };
  }

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: `France VAE Interoperability API (${process.env.ENVIRONMENT})`,
        description:
          "France VAE's interoperability API to interface with other official entities",
        version: "1.0.0",
      },
      servers: [
        {
          url: `${process.env.BASE_URL}`,
          description: `${process.env.ENVIRONMENT?.toUpperCase()} server`,
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
      security,
      components: {
        securitySchemes,
      },
    },
  });

  await fastify.register(swaggerUi, {
    initOAuth: {
      clientId: "reva-admin",
      realm: "reva",
      scopes: "openid profile roles",
    },
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
  });

  fastify.register(formBody);
  fastify.register(multipart);

  addSchemas(fastify);
  addInputSchemas(fastify);
  addResponseSchemas(fastify);

  fastify.decorateRequest("graphqlClient");

  // Validate JWT for pathes :
  // /candidatures
  // /dossiersDeFaisabilite
  // /dossiersDeValidation
  // /informationsJury
  fastify.addHook("onRequest", validateJwt);

  fastify.post(
    "/documentation/openid-connect/token",
    {
      schema: {
        hide: true,
        consumes: ["application/x-www-form-urlencoded"],
        produces: ["application/x-www-form-urlencoded"],
        body: {
          type: "object",
          required: ["grant_type", "code", "client_id", "redirect_uri"],
          properties: {
            grant_type: { type: "string" },
            code: { type: "string" },
            client_id: { type: "string" },
            redirect_uri: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      const requestBody = request.body;
      const tokenReply = await fetch(
        `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_REVA_ADMIN_REALM}/protocol/openid-connect/token`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
          body: new URLSearchParams({
            grant_type: requestBody.grant_type,
            code: requestBody.code,
            client_id: requestBody.client_id,
            redirect_uri: requestBody.redirect_uri,
          }),
        },
      );
      const tokenJson = await tokenReply.json();
      const idToken = tokenJson.id_token;
      const decodedIdToken = jose.decodeJwt(idToken);
      const keycloakId = decodedIdToken.sub;
      if (!keycloakId) {
        throw new Error("keycloakId has not been set");
      }

      const jwt = await generateJwt({ keycloakId });

      return {
        access_token: jwt,
      };
    },
  );

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
      url: "/candidatures/:candidatureId",
      schema: {
        summary: "Récupérer les détails d'une candidature",
        // security: [{ bearerAuth: [] }, { oauth: [] }],
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
          reply.send({
            data: mapCandidacyObject(r),
          });
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
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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
        consumes: ["multipart/form-data"],
        // security: [{ bearerAuth: [] }],
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
        SerializerSchemaOptions: {
          references: [
            typeof dossiersDeFaisabiliteResponseSchema,
            typeof pageInfoSchema,
            typeof candidacyIdSchema,
            typeof fichierSchema,
            typeof dureeExperienceSchema,
            typeof experienceSchema,
            typeof dossierDeFaisabiliteSchema,
            typeof statutDossierDeFaisabiliteSchema,
          ];
        };
      }>
    >()
    .route({
      method: "GET",
      url: "/dossiersDeFaisabilite",
      schema: {
        summary: "Récupérer la liste des dossiers de faisabilité",
        // security: [{ bearerAuth: [] }],
        tags: ["Dossier de faisabilité"],
        querystring: {
          type: "object",
          properties: {
            decalage: {
              type: "integer",
              example: 0,
              description: "Décalage pour la pagination",
              default: 0,
            },
            limite: {
              type: "integer",
              example: 10,
              default: 10,
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
      handler: async (request, reply) => {
        const { decalage, limite, recherche, statut } = request.query;
        const dossiersDeFaisabilite = await getFeasibilities(
          request.graphqlClient,
          decalage,
          limite,
          statut,
          recherche,
        );
        if (dossiersDeFaisabilite) {
          reply.send(mapFeasibilities(dossiersDeFaisabilite));
        } else {
          reply.status(204).send();
        }
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
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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
        consumes: ["multipart/form-data"],
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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
        // security: [{ bearerAuth: [] }],
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

  fastify.route({
    method: "POST",
    url: "/auth/generateJwt",
    schema: {
      hide:
        process.env.ENVIRONMENT !== "local" &&
        process.env.ENVIRONMENT !== "staging",
      summary: "Génère un jeton d'accès pour l'utilisateur demandé",
      tags: ["Authentification"],
      headers: {
        type: "object",
        properties: {
          auth_api_key: { type: "string" },
        },
        required: ["auth_api_key"],
      },
      body: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "Identifiant de l'utilisateur",
          },
        },
        required: ["userId"],
      },
      response: {
        200: {
          description: "Génération du JWT avec succès",
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT",
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { auth_api_key } = request.headers;

      if (!auth_api_key || auth_api_key != process.env.AUTH_API_KEY) {
        reply.status(401).send();
        return;
      }

      const jwt = await generateJwt({ keycloakId: request.body.userId });

      return {
        token: jwt,
      };
    },
  });

  fastify.route({
    method: "POST",
    url: "/auth/invalidJwt",
    schema: {
      hide:
        process.env.ENVIRONMENT !== "local" &&
        process.env.ENVIRONMENT !== "staging",
      summary: "Invalide le jeton d'accès",
      tags: ["Authentification"],
      headers: {
        type: "object",
        properties: {
          auth_api_key: { type: "string" },
        },
        required: ["auth_api_key"],
      },
      body: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "JWT",
          },
        },
        required: ["token"],
      },
    },
    handler: async (request, reply) => {
      const { auth_api_key } = request.headers;

      if (!auth_api_key || auth_api_key != process.env.AUTH_API_KEY) {
        reply.status(401).send();
        return;
      }

      await invalidJwt({ token: request.body.token });

      reply.status(204).send();
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
