import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { getGenderBornLabel } from "@/utils/getGenderBornLabel.util";
import { getGenderPrefix } from "@/utils/getGenderPrefix.util";

import { Candidate } from "@/graphql/generated/graphql";

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
    country,
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

  const isFrance = country ? country?.label == "France" : false;

  return (
    <section>
      <div className="flex">
        <span className="fr-icon-user-fill fr-icon--lg mr-2" />
        <h2>
          {genderLabel}
          {givenName ? givenName : lastname} {firstname}
          {firstname2 ? `, ${firstname2}` : ""}
          {firstname3 ? `, ${firstname3}` : ""}
        </h2>
      </div>
      <p className="mb-2">
        {!!givenName && <span>{`${bornLabel} ${lastname},`}</span>}
        {birthdate && <span> le {formatIso8601Date(birthdate)} </span>}
        <span>
          à {birthCity}
          {country && isFrance && birthDepartment
            ? `${birthCity ? ", " : ""}${birthDepartment.label} (${birthDepartment.code})`
            : ""}
          {country && !isFrance && `${birthCity ? ", " : ""}${country.label}`}
        </span>
      </p>
      {nationality && <p>Nationalité {nationality}</p>}
      <h3>Contact</h3>
      <p className="mb-2">
        Adresse postale : {street} {zip} {city}
      </p>
      <p className="flex gap-4">
        <span>Adresse électronique : {email}</span>
        <span>Téléphone : {phone}</span>
      </p>
      <h3>Niveau de formation</h3>
      <dl>
        <div>
          <dt id="candidate-education-highest-level">
            Niveau de formation le plus élevé
          </dt>
          <dd
            aria-labelledby="candidate-education-highest-level"
            className="mb-2 font-medium ml-0"
          >
            {niveauDeFormationLePlusEleve?.level}
          </dd>
        </div>
        <div>
          <dt id="candidate-education-degree-level">
            Niveau de la certification obtenue la plus élevée
          </dt>
          <dd
            aria-labelledby="candidate-education-degree-level"
            className="mb-2 font-medium ml-0"
          >
            {highestDegree?.level}
          </dd>
        </div>
        {highestDegreeLabel && (
          <div>
            <dt id="candidate-education-degree-title">
              Intitulé de la certification la plus élevée obtenue
            </dt>
            <dd
              aria-labelledby="candidate-education-degree-title"
              className="mb-2 font-medium ml-0"
            >
              {highestDegreeLabel}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
