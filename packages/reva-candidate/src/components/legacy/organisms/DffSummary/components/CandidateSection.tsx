import { format } from "date-fns";

import { GenderEnum } from "@/constants";
import { Candidate, Gender } from "@/graphql/generated/graphql";

function getGenderPrefix(gender: Gender) {
  switch (gender) {
    case GenderEnum.man:
      return "M. ";
    case GenderEnum.woman:
      return "Mme ";
    case GenderEnum.undisclosed:
      return "";
  }
}

function getGenderBornLabel(gender: Gender) {
  switch (gender) {
    case GenderEnum.man:
      return "Né";
    case GenderEnum.woman:
      return "Née";
    case GenderEnum.undisclosed:
      return "Né";
  }
}

export default function CandidateSection({
  candidate,
}: {
  candidate: Candidate;
}) {
  if (!candidate) return null;
  const {
    firstname,
    lastname,
    email,
    gender,
    firstname2,
    firstname3,
    givenName,
    birthdate,
    birthCity,
    birthDepartment,
    nationality,
    phone,
    street,
    zip,
    city,
    niveauDeFormationLePlusEleve,
    highestDegree,
    highestDegreeLabel,
  } = candidate;

  const genderLabel = gender ? getGenderPrefix(gender) : "";
  const bornLabel = gender ? getGenderBornLabel(gender) : "";

  return (
    <div>
      <div className="flex">
        <span
          className="fr-icon-user-fill fr-icon--lg mr-2"
          data-html2canvas-ignore="true"
        />
        <h2>
          {genderLabel}
          {lastname} {firstname}
          {firstname2 ? `, ${firstname2}` : ""}
          {firstname3 ? `, ${firstname3}` : ""}
        </h2>
      </div>
      <p className="mb-2">
        <span>{givenName ? `${bornLabel} ${givenName},` : bornLabel}</span>
        {birthdate && <span> le {format(birthdate, "dd/MM/yyyy")} </span>}
        <span>
          à {birthCity ? `${birthCity},` : ""}{" "}
          {birthDepartment
            ? `${birthDepartment?.label} (${birthDepartment?.code})`
            : ""}
        </span>
      </p>
      {nationality && <p>Nationalité {nationality}</p>}
      <h3>Contact</h3>
      <p className="mb-2">
        Adresse postale : {street} {zip} {city}
      </p>
      <p className="flex gap-4">
        <span>E-mail : {email}</span>
        <span>Téléphone : {phone}</span>
      </p>
      <h3>Niveau de formation</h3>
      <p className="mb-4">
        Niveau de formation le plus élevé: {niveauDeFormationLePlusEleve?.level}
      </p>
      <p className="mb-2">
        Niveau de la certification obtenue la plus élevée :{" "}
        {highestDegree?.level}
      </p>
      <p className="mb-2">{highestDegree?.longLabel}</p>
      {highestDegreeLabel && (
        <p>
          Intitulé de la certification la plus élevée obtenue:{" "}
          {highestDegreeLabel}
        </p>
      )}
    </div>
  );
}
