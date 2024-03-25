"use client";
import { Candidate } from "@/graphql/generated/graphql";
import {
  formatStringToPhoneNumberStructure,
  formatStringToSocialSecurityNumberStructure,
} from "@/utils";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import CandidacySectionCard from "./_components/CandidacySectionCard";
import useCandidateSummary from "./_components/useCandidateSummary";
import { CandidateExperiencesSectionCard } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidateExperiencesSectionCard";

export const checkCandidateFields = (
  object: any,
  fields: (keyof Candidate)[],
) => {
  return fields.every((field) => object[field]);
};

const BadgeCompleted = () => <Badge severity="success">Complété</Badge>;

const BadgeToComplete = () => <Badge severity="warning">À compléter</Badge>;

const CandidacySummaryPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();
  const { candidacy } = useCandidateSummary(candidacyId);

  if (!candidacy) return null;

  const { candidate } = candidacy;
  const isCandidateInformationCompleted = checkCandidateFields(candidate, [
    "firstname",
    "lastname",
    "phone",
    "email",
    "department",
    "birthdate",
    "country",
    "birthCity",
    "nationality",
    "socialSecurityNumber",
    "street",
    "zip",
    "city",
    "phone",
    "email",
  ]);

  const isCandidateProfileCompleted = checkCandidateFields(candidate, [
    "highestDegree",
    "highestDegreeLabel",
    "niveauDeFormationLePlusEleve",
  ]);

  const candidateHasAddressCompleted = checkCandidateFields(candidate, [
    "street",
    "zip",
    "city",
    "department",
  ]);

  return (
    <>
      <div>
        <h1 className="mb-1">Résumé de la candidature</h1>
        <p>
          Vous pouvez compléter ou modifier ces informations jusqu'à l'envoi du
          dossier de faisabilité.
        </p>
      </div>
      {!!candidate && (
        <ul className="flex flex-col gap-8 pl-0 mt-8">
          <CandidacySectionCard
            title="Les informations du candidat"
            hasButton
            buttonOnClick={() =>
              router.push(
                `/candidacies/${candidacyId}/summary/candidate-information`,
              )
            }
            buttonTitle={
              isCandidateInformationCompleted ? "Modifier" : "Compléter"
            }
            buttonPriority={
              isCandidateInformationCompleted ? "secondary" : "primary"
            }
            Badge={
              isCandidateInformationCompleted ? BadgeCompleted : BadgeToComplete
            }
          >
            <dl>
              <dt className="sr-only">Prénom et nom</dt>
              <dd>
                {candidate.firstname} {candidate.lastname}
              </dd>
              <dt className="sr-only">
                Date de naissance, département et nationalité
              </dt>
              <dd>
                {candidate.birthdate &&
                  format(candidate.birthdate, "dd/MM/yyyy")}{" "}
                {candidate.department.label} ({candidate.department.code}){" "}
                {candidate.nationality}
              </dd>
              <dt className="sr-only">Numéro de sécurité sociale</dt>
              <dd className="mb-4">
                {candidate.socialSecurityNumber &&
                  formatStringToSocialSecurityNumberStructure(
                    candidate.socialSecurityNumber,
                  )}
              </dd>
              <dt className="sr-only">Téléphone</dt>
              <dd>
                {candidate.phone &&
                  formatStringToPhoneNumberStructure(candidate.phone)}
              </dd>
              <dt className="sr-only">Adresse email</dt>
              <dd>{candidate.email}</dd>
              <dt className="sr-only">Adresse</dt>
              <dd>
                {candidateHasAddressCompleted &&
                  `${candidate.street}, ${candidate.zip} ${candidate.city}, ${candidate.department.label}`}
              </dd>
            </dl>
          </CandidacySectionCard>
          <CandidacySectionCard
            title="Son profil"
            hasButton
            buttonOnClick={() =>
              router.push(
                `/candidacies/${candidacyId}/summary/candidate-profile`,
              )
            }
            buttonTitle={isCandidateProfileCompleted ? "Modifier" : "Compléter"}
            buttonPriority={
              isCandidateProfileCompleted ? "secondary" : "primary"
            }
            Badge={
              isCandidateProfileCompleted ? BadgeCompleted : BadgeToComplete
            }
          >
            {isCandidateProfileCompleted && (
              <div className="flex flex-col">
                <p className="font-bold">
                  Niveau de la formation la plus élevée
                </p>
                <p>{candidate.niveauDeFormationLePlusEleve?.label}</p>
                <br />
                <p className="font-bold">
                  Intitulé de la certification la plus élevée obtenue
                </p>
                <p>{candidate.highestDegreeLabel}</p>
              </div>
            )}
          </CandidacySectionCard>

          <CandidateExperiencesSectionCard
            experiences={candidacy.experiences.map((e) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              startedAt: new Date(e.startedAt),
              duration: e.duration,
            }))}
          />
        </ul>
      )}
    </>
  );
};

export default CandidacySummaryPage;
