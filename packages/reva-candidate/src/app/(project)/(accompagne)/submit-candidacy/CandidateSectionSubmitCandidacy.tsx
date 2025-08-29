import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { getGenderPrefix } from "@/utils/getGenderPrefix.util";

import { CandidateUseSubmitCandidacyForDashboard } from "./submit-candidacy-dashboard.hook";

export default function CandidateSectionSubmitCandidacy({
  candidate,
}: {
  candidate: CandidateUseSubmitCandidacyForDashboard;
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
  } = candidate;

  const genderLabel = gender ? getGenderPrefix(gender) : "";

  const birthCityLabel =
    birthCity || birthDepartment?.code
      ? `${birthCity} ${birthDepartment?.code ? `(${birthDepartment.code})` : ""}`
      : "-";

  const fullNameLabel = `${genderLabel} ${givenName ? givenName : lastname}${firstname ? `, ${firstname}` : ""}${firstname2 ? `, ${firstname2}` : ""}${firstname3 ? `, ${firstname3}` : ""}`;

  return (
    <div>
      <div className="flex">
        <span className="fr-icon-user-fill fr-icon--lg mr-2" />
        <h2>Mes informations</h2>
      </div>
      <div className="pl-10">
        <h3 className="mb-4">Civilité</h3>
        <p className="font-medium text-lg mb-4">{fullNameLabel}</p>
        <div className="flex gap-12">
          {!!givenName && (
            <div>
              <p className="mb-0">Nom de naissance</p>
              <p className="font-medium">{lastname}</p>
            </div>
          )}
          <div>
            <p className="mb-0">Date de naissance</p>
            <p className="font-medium">
              {birthdate ? formatIso8601Date(birthdate) : "-"}
            </p>
          </div>
          <div>
            <p className="mb-0">Ville de naissance</p>
            <p className="font-medium">{birthCityLabel}</p>
          </div>
          <div>
            <p className="mb-0">Nationalité</p>
            <p className="font-medium">{nationality || "-"}</p>
          </div>
        </div>

        <h3>Contact</h3>
        <div className="flex gap-12">
          <div>
            <p className="mb-0">Adresse postale</p>
            <p className="font-medium mb-0">{street || "-"}</p>
            {(zip || city) && (
              <p className="font-medium mb-0">
                {zip} {city}
              </p>
            )}
          </div>
          <div>
            <p className="mb-0">E-mail</p>
            <p className="font-medium mb-0">{email}</p>
          </div>
          <div>
            <p className="mb-0">Téléphone</p>
            <p className="font-medium mb-0">{phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
