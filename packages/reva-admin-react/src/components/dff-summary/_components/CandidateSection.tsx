import CallOut from "@codegouvfr/react-dsfr/CallOut";

import { GenderEnum } from "@/constants/genders.constant";
import { formatIso8601Date } from "@/utils/formatIso8601Date";

import {
  Candidate,
  CandidateTypology,
  Gender,
} from "@/graphql/generated/graphql";

function getGenderPrefix(gender: Gender) {
  switch (gender) {
    case GenderEnum.man:
      return "M. ";
    case GenderEnum.woman:
      return "Mme ";
    case GenderEnum.undisclosed:
      return "Non spécifié";
  }
}

function getCandidateTypologyLabel(typology: CandidateTypology) {
  switch (typology) {
    case "NON_SPECIFIE":
      return "Non spécifié";
    case "SALARIE_PRIVE":
      return "Salarié du privé";
    case "BENEVOLE":
      return "Bénévole";
    case "AIDANTS_FAMILIAUX":
      return "Aidant familial";
    case "AIDANTS_FAMILIAUX_AGRICOLES":
      return "Aidant familial agricole";
    case "DEMANDEUR_EMPLOI":
      return "Demandeur d'emploi";
    case "TRAVAILLEUR_NON_SALARIE":
      return "Travailleur non salarié";
    case "RETRAITE":
      return "Retraité";
    case "TITULAIRE_MANDAT_ELECTIF":
      return "Titulaire d’un mandat électif";
    case "CONJOINT_COLLABORATEUR":
      return "Conjoint collaborateur";
    case "STAGIAIRE":
      return "Stagiaire";
    case "SALARIE_PUBLIC":
      return "Salarié public";
    case "SALARIE_PUBLIC_HOSPITALIER":
      return "Salarié public hospitalier";
    case "SALARIE_ALTERNANT":
      return "Salarié alternant";
    case "SALARIE_INTERIMAIRE":
      return "Salarié interimaire";
    case "SALARIE_INTERMITTENT":
      return "Salarié intermittent";
    case "SALARIE_EN_CONTRATS_AIDES":
      return "Salarié en contrats d'aides";
    case "AUTRE":
      return "Autre";
    default:
      return typology;
  }
}

export default function CandidateSection({
  candidate,
  typology,
  conventionCollective,
}: {
  candidate: Candidate;
  typology: CandidateTypology;
  conventionCollective?: string | null;
}) {
  if (!candidate) return null;
  const {
    firstname,
    lastname,
    email,
    gender,
    firstname2,
    firstname3,
    birthdate,
    birthCity,
    birthDepartment,
    nationality,
    phone,
    street,
    addressComplement,
    zip,
    city,
    niveauDeFormationLePlusEleve,
    highestDegree,
    highestDegreeLabel,
  } = candidate;

  const genderLabel = gender ? getGenderPrefix(gender) : "";

  return (
    <div className="flex flex-col gap-6">
      <h3 className="mb-0">Civilité</h3>
      <div className="flex flex-col gap-6 ml-10">
        <div className="flex flex-row gap-4 flex-wrap">
          <dl className="w-[170px]">
            <dt>Civilité</dt>
            <dd className="font-medium">{genderLabel}</dd>
          </dl>
          <dl className="w-[170px]">
            <dt>Nom de naissance</dt>
            <dd className="font-medium">{lastname}</dd>
          </dl>
          <dl className="w-[170px]">
            <dt>Prénoms</dt>
            <dd className="font-medium">
              {firstname}
              {firstname2 ? `, ${firstname2}` : ""}
              {firstname3 ? `, ${firstname3}` : ""}
            </dd>
          </dl>
          <dl className="w-[170px]">
            <dt>Date de naissance</dt>
            <dd className="font-medium">
              {birthdate ? formatIso8601Date(birthdate) : "-"}
            </dd>
          </dl>
          <dl className="w-[170px]">
            <dt>Ville de naissance</dt>
            <dd className="font-medium">
              {birthCity}
              {birthDepartment ? ` (${birthDepartment.code})` : ""}
            </dd>
          </dl>
          <dl className="w-[170px]">
            <dt>Nationalité</dt>
            <dd className="font-medium">{nationality}</dd>
          </dl>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="mb-0">Niveau de formation</h4>
          <dl>
            <dt>Niveau de formation le plus élevé</dt>
            <dd className="font-medium">
              {niveauDeFormationLePlusEleve?.level}
            </dd>
          </dl>
          <dl>
            <dt>Niveau de la certification obtenue la plus élevée</dt>
            <dd className="font-medium">{highestDegree?.level}</dd>
          </dl>
          <dl>
            <dt>Intitulé de la certification la plus élevée obtenue</dt>
            <dd className="font-medium">{highestDegreeLabel}</dd>
          </dl>
        </div>
      </div>
      <h3 className="mb-0">Contact</h3>
      <div className="flex flex-col gap-4 ml-10">
        <dl>
          <dt>Adresse postale</dt>
          <dd className="font-medium">
            {street} {addressComplement ? `, ${addressComplement}` : ""} {zip}{" "}
            {city}
          </dd>
        </dl>
        <div className="flex flex-row gap-4 flex-wrap">
          <dl>
            <dt>Adresse électronique</dt>
            <dd className="font-medium">{email}</dd>
          </dl>
          <dl>
            <dt>Téléphone</dt>
            <dd className="font-medium">{phone}</dd>
          </dl>
        </div>
      </div>
      <h3 className="mb-0">Statut</h3>
      <div className="flex flex-col gap-4 ml-10">
        <p className="font-medium mb-0">
          {getCandidateTypologyLabel(typology)}
        </p>

        {conventionCollective && (
          <>
            <h4 className="mb-0">
              Convention collective de l’employeur du candidat
            </h4>{" "}
            <CallOut>{conventionCollective}</CallOut>
          </>
        )}
      </div>
    </div>
  );
}
