import { FastifyInstance } from "fastify";

export const candidacyIdSchema = {
  $id: "http://vae.gouv.fr/components/schemas/CandidatureId",
  type: "string",
  format: "uuid",
  example: "123e4567-e89b-12d3-a456-426614174000",
  description: "Identifiant de la candidature",
} as const;

export const situationSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Situation",
  type: "object",
  properties: {
    niveauCertificationObtenuePlusEleve: {
      $ref: "http://vae.gouv.fr/components/schemas/Diplome",
    },
    intituleCertificationObtenuePlusEleve: {
      type: "string",
      maxLength: 255,
      example: "Baccalauréat Scientifique",
    },
    niveauFormationPlusEleve: {
      $ref: "http://vae.gouv.fr/components/schemas/Diplome",
    },
    typologie: {
      $ref: "http://vae.gouv.fr/components/schemas/TypologieCandidat",
    },
  },
} as const;

export const organismeSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Organisme",
  type: "object",
  properties: {
    nom: {
      type: "string",
      maxLength: 255,
      example: "Organisme de Formation ABC",
    },
    contact: {
      $ref: "http://vae.gouv.fr/components/schemas/Contact",
    },
    siteWeb: {
      type: "string",
      maxLength: 255,
      format: "uri",
      example: "https://www.organisme-abc.fr",
    },
  },
} as const;

const contactSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Contact",
  type: "object",
  properties: {
    nom: {
      type: "string",
      maxLength: 255,
      example: "John Doe",
    },
    email: {
      type: "string",
      maxLength: 255,
      format: "email",
      example: "contact@organisme-abc.fr",
    },
    telephone: {
      type: "string",
      maxLength: 255,
      example: "+33123456789",
    },
  },
} as const;

export const candidatSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Candidat",
  type: "object",
  properties: {
    genre: {
      $ref: "http://vae.gouv.fr/components/schemas/Genre",
    },
    prenom: {
      type: "string",
      maxLength: 255,
      example: "Alice",
    },
    prenom2: {
      type: "string",
      maxLength: 255,
      example: "Marie",
    },
    prenom3: {
      type: "string",
      maxLength: 255,
      example: "Claire",
    },
    nom: {
      type: "string",
      maxLength: 255,
      example: "Doe",
    },
    nomUsage: {
      type: "string",
      maxLength: 255,
      example: "Poe",
    },
    communeNaissance: {
      type: "string",
      maxLength: 255,
      example: "Paris",
    },
    departementNaissance: {
      $ref: "http://vae.gouv.fr/components/schemas/Departement",
    },
    dateNaissance: {
      type: "string",
      format: "date",
      example: "1980-01-01",
    },
    nationalite: {
      type: "string",
      maxLength: 255,
      example: "Française",
    },
    situation: {
      $ref: "http://vae.gouv.fr/components/schemas/Situation",
    },
    email: {
      type: "string",
      maxLength: 255,
      format: "email",
      example: "alice.doe@example.com",
    },
    telephone: {
      type: "string",
      maxLength: 10,
      minLength: 10,
      example: "+33612345678",
    },
    adresse: {
      $ref: "http://vae.gouv.fr/components/schemas/Adresse",
    },
  },
} as const;

export const typologieCandidatSchema = {
  $id: "http://vae.gouv.fr/components/schemas/TypologieCandidat",
  type: "string",
  enum: [
    "NON_SPECIFIE",
    "SALARIE_PRIVE",
    "SALARIE_PUBLIC",
    "SALARIE_PUBLIC_HOSPITALIER",
    "SALARIE_ALTERNANT",
    "SALARIE_INTERIMAIRE",
    "SALARIE_INTERMITTENT",
    "SALARIE_EN_CONTRATS_AIDES",
    "TRAVAILLEUR_NON_SALARIE",
    "CONJOINT_COLLABORATEUR",
    "DEMANDEUR_EMPLOI",
    "AIDANTS_FAMILIAUX",
    "AIDANTS_FAMILIAUX_AGRICOLES",
    "BENEVOLE",
    "STAGIAIRE",
    "TITULAIRE_MANDAT_ELECTIF",
    "AUTRE",
  ],
  description: "Typologie du candidat",
  example: "SALARIE_PRIVE",
} as const;

export const diplomeSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Diplome",
  type: "object",
  properties: {
    code: {
      type: "string",
      maxLength: 255,
      description:
        "Code du diplôme (N1_SANS, N2_CLEA, N3_CAP_BEP, N4_BAC, N5_BAC_2, N6_BAC_3_4, N7_BAC_5 ou N8_BAC_8)\n",
      example: "N4_BAC",
    },
    label: {
      type: "string",
      maxLength: 255,
      example: "Niveau 4 : Baccalauréat",
    },
    labelLong: {
      type: "string",
      maxLength: 255,
      example:
        "Niveau 4 (Bac pro, Brevet professionnel, CQP 4, MC 4, Titre professionnel 4, DE 4)",
    },
    niveau: {
      type: "integer",
      example: 4,
    },
  },
} as const;

export const departementSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Departement",
  type: "object",
  properties: {
    code: {
      type: "string",
      maxLength: 5,
      description: "Code du département",
      example: "973",
    },
    nom: {
      type: "string",
      maxLength: 255,
      description: "Nom du département",
      example: "Guyane",
    },
  },
} as const;

export const adresseSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Adresse",
  type: "object",
  properties: {
    departement: {
      $ref: "http://vae.gouv.fr/components/schemas/Departement",
    },
    codePostal: {
      type: "string",
      pattern: "^\\d{5}$",
      description: "Code postal",
      example: "75001",
    },
    rue: {
      type: "string",
      maxLength: 255,
      description: "Rue",
      example: "1234 rue de la Paix",
    },
    complementAdresse: {
      type: "string",
      maxLength: 255,
      description: "Complément d'adresse",
      example: "Bâtiment A",
    },
    ville: {
      type: "string",
      maxLength: 255,
      description: "Ville",
      example: "Paris",
    },
    pays: {
      type: "string",
      maxLength: 255,
      description: "Pays",
      example: "France",
    },
  },
} as const;

export const certificationSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Certification",
  type: "object",
  properties: {
    codeRncp: {
      type: "string",
      maxLength: 255,
      example: "35830",
    },
    nom: {
      type: "string",
      maxLength: 255,
      example: "Diplôme d'Etat Aide soignant - DEAS",
    },
    estViseePartiellement: {
      type: "boolean",
      example: false,
    },
  },
} as const;

export const candidatureSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Candidature",
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      example: "123e4567-e89b-12d3-a456-426614174000",
    },
    certification: {
      $ref: "http://vae.gouv.fr/components/schemas/Certification",
    },
    candidat: {
      $ref: "http://vae.gouv.fr/components/schemas/Candidat",
    },
    organisme: {
      $ref: "http://vae.gouv.fr/components/schemas/Organisme",
    },
  },
} as const;

export const fichierSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Fichier",
  type: "object",
  properties: {
    nom: {
      type: "string",
      maxLength: 255,
      example: "document.pdf",
    },
    url: {
      type: "string",
      example: "https://files.vae.gouv.fr/abc/document.pdf",
    },
    typeMime: {
      type: "string",
      maxLength: 255,
      example: "application/pdf",
    },
  },
} as const;

export const informationJurySchema = {
  $id: "http://vae.gouv.fr/components/schemas/InformationJury",
  type: "object",
  properties: {
    candidatureId: {
      $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
    },
    statut: {
      $ref: "http://vae.gouv.fr/components/schemas/StatutJury",
    },
  },
} as const;

export const dossierDeFaisabiliteSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabilite",
  type: "object",
  properties: {
    candidatureId: {
      $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
    },
    dateEnvoi: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T10:00:00Z",
    },
    documents: {
      type: "array",
      description:
        "Le dossier de faisabilité, la pièce d'identité et autres documents éventuels",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/Fichier",
      },
    },
    experiences: {
      type: "array",
      description: "Les expériences du candidat",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/Experience",
      },
    },
    statut: {
      $ref: "http://vae.gouv.fr/components/schemas/StatutDossierDeFaisabilite",
    },
  },
} as const;

export const experienceSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Experience",
  type: "object",
  properties: {
    titre: {
      type: "string",
      description: "Titre de l'expérience",
      example: "Boulanger",
    },
    description: {
      type: "string",
      description: "Description de l'expérience",
      example: "Préparation et cuisson de pains et viennoiseries",
    },
    duree: {
      $ref: "http://vae.gouv.fr/components/schemas/DureeExperience",
    },
    dateDemarrage: {
      type: "string",
      format: "date",
      description: "Date de démarrage de l'expérience",
      example: "2021-01-01",
    },
  },
} as const;

export const dossierDeFaisabiliteDecisionSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeFaisabiliteDecision",
  type: "object",
  properties: {
    decision: {
      $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeFaisabilite",
    },
    commentaire: {
      type: "string",
      description: "Motifs éventuels de la décision",
      example: "La pièce d'identité n'est pas lisible.",
    },
    dateEnvoi: {
      type: "string",
      format: "date-time",
      description: "Date d'envoi de la décision",
      example: "2023-10-05T15:00:00Z",
    },
    document: {
      $ref: "http://vae.gouv.fr/components/schemas/Fichier",
    },
  },
} as const;

export const dossierDeValidationSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidation",
  type: "object",
  properties: {
    candidatureId: {
      $ref: "http://vae.gouv.fr/components/schemas/CandidatureId",
    },
    dateEnvoi: {
      type: "string",
      format: "date-time",
      example: "2023-11-01T10:00:00Z",
    },
    documents: {
      type: "array",
      description: "La dossier de validation et autres documents éventuels",
      items: {
        $ref: "http://vae.gouv.fr/components/schemas/Fichier",
      },
    },
    statut: {
      $ref: "http://vae.gouv.fr/components/schemas/StatutDossierDeValidation",
    },
  },
} as const;

export const decisionDossierDeValidationSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DecisionDossierDeValidation",
  type: "string",
  enum: ["SIGNALE", "VERIFIE"],
  description: "Décision sur le dossier de validation.\n",
  example: "SIGNALE",
} as const;

export const dossierDeValidationDecisionSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DossierDeValidationDecision",
  type: "object",
  properties: {
    decision: {
      $ref: "http://vae.gouv.fr/components/schemas/DecisionDossierDeValidation",
    },
    commentaire: {
      type: "string",
      description: "Commentaire sur la décision",
      example: "Le dossier n'est pas lisible.",
    },
    dateEnvoi: {
      type: "string",
      format: "date-time",
      description: "Date d'envoi de la décision",
      example: "2023-11-05T16:00:00Z",
    },
  },
} as const;

export const statutDossierDeFaisabiliteSchema = {
  $id: "http://vae.gouv.fr/components/schemas/StatutDossierDeFaisabilite",
  type: "string",
  enum: [
    "EN_ATTENTE",
    "IRRECEVABLE",
    "RECEVABLE",
    "INCOMPLET",
    "COMPLET",
    "ARCHIVE",
    "ABANDONNE",
  ],
  description: "Statut pour filtrer les dossiers de faisabilité",
  example: "EN_ATTENTE",
} as const;

export const statutDossierDeValidationSchema = {
  $id: "http://vae.gouv.fr/components/schemas/StatutDossierDeValidation",
  type: "string",
  enum: ["EN_ATTENTE", "SIGNALE", "VERIFIE"],
  description: "Statut pour filtrer les dossiers de validation.\n",
  example: "VERIFIE",
} as const;

export const statutJurySchema = {
  $id: "http://vae.gouv.fr/components/schemas/StatutJury",
  type: "string",
  enum: ["PROGRAMME", "PASSE"],
  description: "Statut pour filtrer les jurys.\n",
  example: "PROGRAMME",
} as const;

export const resultatJurySchema = {
  $id: "http://vae.gouv.fr/components/schemas/ResultatJury",
  type: "string",
  enum: [
    "SUCCES_TOTAL_CERTIFICATION_COMPLETE",
    "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
    "SUCCES_PARTIEL_CERTIFICATION_COMPLETE",
    "SUCCES_TOTAL_CERTIFICATION_PARTIELLE",
    "SUCCES_PARTIEL_CERTIFICATION_PARTIELLE",
    "ECHEC",
    "CANDIDAT_EXCUSE",
    "CANDIDAT_ABSENT",
  ],
  description: "Résultat d'un jury.\n",
  example: "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
} as const;

export const decisionDossierDeFaisabiliteSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DecisionDossierDeFaisabilite",
  type: "string",
  enum: ["IRRECEVABLE", "RECEVABLE", "INCOMPLET", "COMPLET"],
  description: "Décision sur le dossier de faisabilité.",
  example: "INCOMPLET",
} as const;

export const genreSchema = {
  $id: "http://vae.gouv.fr/components/schemas/Genre",
  type: "string",
  enum: ["HOMME", "FEMME", "NON_SPECIFIE"],
  example: "FEMME",
  description: "Genre du candidat",
} as const;

export const dureeExperienceSchema = {
  $id: "http://vae.gouv.fr/components/schemas/DureeExperience",
  type: "string",
  enum: [
    "INCONNU",
    "MOINS_D_UN_AN",
    "ENTRE_UN_ET_TROIS_ANS",
    "PLUS_DE_TROIS_ANS",
    "PLUS_DE_CINQ_ANS",
    "PLUS_DE_DIX_ANS",
  ],
  description: "Durée de l'expérience",
  example: "ENTRE_UN_ET_TROIS_ANS",
} as const;

const schemas = [
  candidacyIdSchema,
  situationSchema,
  organismeSchema,
  contactSchema,
  typologieCandidatSchema,
  genreSchema,
  diplomeSchema,
  departementSchema,
  adresseSchema,
  candidatSchema,
  certificationSchema,
  candidatureSchema,
  fichierSchema,
  resultatJurySchema,
  statutJurySchema,
  informationJurySchema,
  dossierDeFaisabiliteSchema,
  statutDossierDeFaisabiliteSchema,
  decisionDossierDeFaisabiliteSchema,
  statutDossierDeValidationSchema,
  experienceSchema,
  decisionDossierDeValidationSchema,
  dossierDeFaisabiliteDecisionSchema,
  dossierDeValidationDecisionSchema,
  dossierDeValidationSchema,
  dureeExperienceSchema,
];

export const addSchemas = (fastify: FastifyInstance) => {
  for (const schema of schemas) {
    fastify.addSchema(schema);
  }
};
