"use client";
import { Candidate } from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useParams, useRouter } from "next/navigation";
import CandidacySectionCard from "./_components/CandidacySectionCard";
import useCandidateSummary from "./_components/useCandidateSummary";

const checkCandidateFields = (object: any, fields: (keyof Candidate)[]) => {
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

  return (
    <div className="flex flex-col w-full gap-8">
      <div>
        <h1 className="text-[40px] leading-[48px] font-bold mb-2">
          Résumé de la candidature
        </h1>
        <p>
          Vous pouvez compléter ou modifier ces informations jusqu'à l'envoi du
          dossier de faisabilité.
        </p>
      </div>
      {!!candidate && (
        <ul className="flex flex-col gap-8">
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
            <div>
              <div className="mb-4">
                <p>
                  {candidate.firstname} {candidate.lastname}
                </p>
                <p>
                  {candidate.department.label} ({candidate.department.code})
                </p>
              </div>
              <div>
                <p>{candidate.phone}</p>
                <p>{candidate.email}</p>
              </div>
            </div>
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
        </ul>
      )}
    </div>
  );
};

export default CandidacySummaryPage;
