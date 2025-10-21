import { FromSchema } from "json-schema-to-ts";

import { candidatureResponseSchema } from "../../responseSchemas.js";
import {
  adresseSchema,
  candidacyIdSchema,
  candidatSchema,
  candidatureSchema,
  certificationSchema,
  contactSchema,
  departementSchema,
  diplomeSchema,
  genreSchema,
  organismeSchema,
  situationSchema,
  typologieCandidatSchema,
} from "../../schemas.js";

import { getCandidacyById } from "./getCandidacyById.js";

const mapCandidateGender = (
  gender?: string | null,
): "HOMME" | "FEMME" | "NON_SPECIFIE" | null => {
  if (!gender) return null;
  switch (gender) {
    case "man":
      return "HOMME";
    case "woman":
      return "FEMME";
    default:
      return "NON_SPECIFIE";
  }
};

type MappedCandidacy = FromSchema<
  typeof candidatureSchema,
  {
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
      typeof contactSchema,
      typeof organismeSchema,
    ];
  }
>;

export const mapGetCandidacyById = (
  candidacy: Awaited<ReturnType<typeof getCandidacyById>>,
): MappedCandidacy => {
  if (!candidacy) throw new Error("Candidature non trouvée");
  if (!candidacy.candidate)
    throw new Error(
      "La candidature n'a pas de candidat associé. Cela ne devrait pas arriver. Merci de signaler le problème.",
    );
  if (!candidacy.certification)
    throw new Error("La candidature n'est rattachée à aucune certification");

  return {
    id: candidacy.id,
    candidat: {
      prenom: candidacy.candidate.firstname,
      nom: candidacy.candidate.lastname,
      nomUsage: candidacy.candidate.givenName || null,
      genre: mapCandidateGender(candidacy.candidate.gender),
      dateNaissance: candidacy.candidate.birthdate
        ? new Date(candidacy.candidate.birthdate).toISOString()
        : null,
      communeNaissance: candidacy.candidate.birthCity || null,
      departementNaissance: candidacy.candidate.birthDepartment
        ? {
            code: candidacy.candidate.birthDepartment?.code,
            nom: candidacy.candidate.birthDepartment?.label,
          }
        : null,
      nationalite: candidacy.candidate.country?.label || null,
      situation: {
        intituleCertificationObtenuePlusEleve:
          candidacy.candidate.highestDegreeLabel || null,
        niveauCertificationObtenuePlusEleve: candidacy.candidate.highestDegree
          ? {
              code: candidacy.candidate.highestDegree.code,
              label: candidacy.candidate.highestDegree.label,
              labelLong: candidacy.candidate.highestDegree.longLabel,
              niveau: candidacy.candidate.highestDegree.level,
            }
          : null,
        niveauFormationPlusEleve: candidacy.candidate
          .niveauDeFormationLePlusEleve
          ? {
              code: candidacy.candidate.niveauDeFormationLePlusEleve.code,
              label: candidacy.candidate.niveauDeFormationLePlusEleve.label,
              labelLong:
                candidacy.candidate.niveauDeFormationLePlusEleve.longLabel,
              niveau: candidacy.candidate.niveauDeFormationLePlusEleve.level,
            }
          : null,
        typologie: candidacy.typology,
      },
      telephone: candidacy.candidate.phone,
      email: candidacy.candidate.email,
      adresse: {
        codePostal: candidacy.candidate.zip || null,
        rue: candidacy.candidate.street || null,
        ville: candidacy.candidate.city || null,
        pays: candidacy.candidate.country?.label || null,
        codePays: candidacy.candidate.country?.isoCode?.toUpperCase() || null,
        departement: {
          code: candidacy.candidate.department.code,
          nom: candidacy.candidate.department.label,
        },
      },
    },
    certification: {
      codeRncp: candidacy.certification.codeRncp,
      estViseePartiellement: candidacy.isCertificationPartial ?? null,
      nom: candidacy.certification.label,
    },
    organisme: candidacy.organism
      ? {
          nom: candidacy.organism.nomPublic || candidacy.organism?.label,
          siteWeb: candidacy.organism.siteInternet || null,
          contact: {
            nom: candidacy.organism.label,
            email: candidacy.organism?.contactAdministrativeEmail,
            telephone: candidacy.organism?.contactAdministrativePhone || null,
          },
        }
      : null,
  };
};
