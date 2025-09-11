import { FastifyInstance } from "fastify";

export const candidatureResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/CandidatureResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/Candidature",
    },
  },
} as const;

export const pageInfoSchema = {
  $id: "http://vae.gouv.fr/components/schemas/InfoPagination",
  type: "object",
  required: ["totalElements", "totalPages", "pageCourante"],
  properties: {
    totalElements: {
      type: "integer",
      description: "Nombre total d'éléments",
      example: 100,
    },
    totalPages: {
      type: "integer",
      description: "Nombre total de pages",
      example: 10,
    },
    pageCourante: {
      type: "integer",
      description: "Page courante",
      example: 1,
    },
  },
} as const;

export const dossiersDeFaisabiliteResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossiersDeFaisabiliteResponse",
  type: "object",
  required: ["data", "info"],
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabilite",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const dossierDeFaisabiliteResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabilite",
    },
  },
} as const;

export const dossierDeFaisabiliteDecisionsResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionsResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecision",
      },
    },
  },
} as const;

export const dossierDeFaisabiliteDecisionResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecisionResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecision",
    },
  },
} as const;

export const dossiersDeValidationResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossiersDeValidationResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const dossierDeValidationResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
    },
  },
} as const;

export const dossierDeValidationDecisionsResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionsResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecision",
      },
    },
  },
} as const;

export const dossierDeValidationDecisionResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecisionResponse",
  type: "object",
  properties: {
    data: {
      $ref: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecision",
    },
  },
} as const;

export const informationsJuryResponseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/InformationsJuryResponse",
  type: "object",
  properties: {
    data: {
      type: "array",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/InformationJury",
      },
    },
    info: {
      $ref: "http://vae.gouv.fr/components/schemas/InfoPagination",
    },
  },
} as const;

export const addResponseSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(dossiersDeFaisabiliteResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteDecisionsResponseSchema);

  fastify.addSchema(dossierDeFaisabiliteDecisionResponseSchema);

  fastify.addSchema(dossiersDeValidationResponseSchema);

  fastify.addSchema(dossierDeValidationResponseSchema);

  fastify.addSchema(dossierDeValidationDecisionsResponseSchema);

  fastify.addSchema(dossierDeValidationDecisionResponseSchema);

  fastify.addSchema(informationsJuryResponseSchema);

  fastify.addSchema({
    $id: "http://vae.gouv.fr/components/schemas/InformationJuryResponse",
    type: "object",
    properties: {
      data: {
        $ref: "http://vae.gouv.fr/components/schemas/InformationJury",
      },
    },
  });

  fastify.addSchema({
    $id: "http://vae.gouv.fr/components/schemas/SessionJuryResponse",
    type: "object",
    properties: {
      date: {
        type: "string",
        format: "date",
        description: "Date de la session du jury",
        example: "2023-12-15",
      },
      heure: {
        type: "string",
        format: "time",
        description: "Heure de la session du jury",
        example: "14:30",
      },
      adresseSession: {
        type: "string",
        description: "Adresse où se tient la session",
        example: "876 rue de l'Université, 75007 Paris",
      },
      informationsSession: {
        type: "string",
        description: "Informations supplémentaires sur la session",
        example: "Veuillez apporter une pièce d'identité.",
      },
    },
  });

  fastify.addSchema({
    $id: "http://vae.gouv.fr/components/schemas/ResultatJuryResponse",
    type: "object",
    properties: {
      resultat: {
        $ref: "http://vae.gouv.fr/components/schemas/ResultatJury",
      },
      dateEnvoi: {
        type: "string",
        format: "date-time",
        description: "Date d'envoi du résultat du jury",
        example: "2023-10-01T10:00:00Z",
      },
      commentaire: {
        type: "string",
        description: "Informations supplémentaires sur le résultat",
        example: "Validation totale sous réserve de présentation de l’AFGSU.",
      },
    },
  });

  fastify.addSchema(candidatureResponseSchema);

  fastify.addSchema(pageInfoSchema);
};
