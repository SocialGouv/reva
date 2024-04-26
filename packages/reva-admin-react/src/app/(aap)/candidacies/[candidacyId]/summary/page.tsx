"use client";
import { CandidateExperiencesSectionCard } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidateExperiencesSectionCard";
import {
  formatStringToPhoneNumberStructure,
} from "@/utils";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { checkCandidateFields } from "./_components/checkCandidateFields";
import useCandidateSummary from "./_components/useCandidateSummary";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useTakeOverCandidacy } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/takeOverCondidacy";
import { useEffect } from "react";
import { CandidacySummaryBottomButtons } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidacySummaryBottomButtons";
import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import {
  BadgeCompleted,
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { CertificationCard } from "./_components/CertificationCard";
import { Impersonate } from "@/components/impersonate";

const CandidacySummaryPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();

  const { candidacy } = useCandidateSummary(candidacyId);

  const { takeOverCandidacy } = useTakeOverCandidacy();

  //mark the candidacy has "taken over" when the AAP opens it
  useEffect(() => {
    if (candidacy) {
      const candidacyActiveStatus = candidacy.candidacyStatuses.find(
        (s) => s.isActive && s.status === "VALIDATION",
      )?.status;
      if (candidacyActiveStatus) {
        takeOverCandidacy({
          candidacyId: candidacy.id,
          candidacyActiveStatus,
        });
      }
    }
  }, [candidacy, takeOverCandidacy]);

  if (!candidacy) return null;

  const { candidate, certification, admissibilityFvae, goals } = candidacy;

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
    "street",
    "zip",
    "city",
    "phone",
    "email",
  ]);

  const isCandidateProfileCompleted = checkCandidateFields(candidate, [
    "highestDegree",
    "niveauDeFormationLePlusEleve",
  ]);

  const candidateHasAddressCompleted = checkCandidateFields(candidate, [
    "street",
    "zip",
    "city",
    "department",
  ]);

  const isCandidacyAdmissibilityComplete =
    admissibilityFvae &&
    (!admissibilityFvae.isAlreadyAdmissible || admissibilityFvae.expiresAt);

  const isCandidacyAlreadyAdmissible = admissibilityFvae?.isAlreadyAdmissible;

  const isCandidacyAdmissibilityExpired =
    admissibilityFvae &&
    admissibilityFvae.isAlreadyAdmissible &&
    admissibilityFvae.expiresAt &&
    admissibilityFvae.expiresAt < new Date().getTime();

  return (
    <>
      <div>
        <div className="flex justify-between mb-1">
          <h1>Résumé de la candidature</h1>

          <Impersonate candidateId={candidacy.candidate?.id} />
        </div>

        <p>
          Vous pouvez compléter ou modifier ces informations jusqu'à l'envoi du
          dossier de faisabilité.
        </p>
      </div>
      {!!candidate && (
        <>
          <ul className="flex flex-col gap-8 pl-0 mt-8">
            <DefaultCandidacySectionCard
              title="Les informations du candidat"
              buttonOnClickHref={`/candidacies/${candidacyId}/summary/candidate-information`}
              status={
                isCandidateInformationCompleted ? "COMPLETED" : "TO_COMPLETE"
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
            </DefaultCandidacySectionCard>
            <DefaultCandidacySectionCard
              title="Son profil"
              buttonOnClickHref={`/candidacies/${candidacyId}/summary/candidate-profile`}
              status={isCandidateProfileCompleted ? "COMPLETED" : "TO_COMPLETE"}
            >
              {isCandidateProfileCompleted && (
                <div className="flex flex-col">
                  <p className="font-bold mb-0">
                    Niveau de la formation la plus élevée
                  </p>
                  <p className="mb-0">
                    {candidate.niveauDeFormationLePlusEleve?.label}
                  </p>
                  <br />
                  <p className="font-bold mb-0">
                    Intitulé de la certification la plus élevée obtenue
                  </p>
                  <p className="mb-0">{candidate.highestDegreeLabel}</p>
                </div>
              )}
            </DefaultCandidacySectionCard>
            <CertificationCard candidacy={candidacy} />
            <CandidacySectionCard
              title="Sa recevabilité"
              hasButton
              buttonOnClick={() =>
                router.push(`/candidacies/${candidacyId}/admissibility`)
              }
              buttonTitle={
                isCandidacyAdmissibilityComplete ? "Modifier" : "Compléter"
              }
              buttonPriority={
                isCandidacyAdmissibilityComplete ? "secondary" : "primary"
              }
              badge={
                isCandidacyAdmissibilityExpired ? (
                  <Badge severity="warning">
                    Recevabilité favorable expirée
                  </Badge>
                ) : isCandidacyAlreadyAdmissible ? (
                  <Badge severity="success">
                    Recevabilité favorable en cours
                  </Badge>
                ) : isCandidacyAdmissibilityComplete ? (
                  <BadgeCompleted />
                ) : (
                  <BadgeToComplete />
                )
              }
            >
              {admissibilityFvae?.expiresAt && (
                <span>
                  Date de fin de validité :{" "}
                  {format(admissibilityFvae?.expiresAt, "dd/MM/yyyy")}
                </span>
              )}
              {!isCandidacyAdmissibilityComplete && (
                <SmallNotice>
                  Besoin d'aide sur la recevabilité ? Consultez les questions
                  fréquentes de nos utilisateurs à ce sujet.
                </SmallNotice>
              )}
            </CandidacySectionCard>
            <GrayCard>
              <span className="text-2xl font-bold mb-5">Ses objectifs</span>
              {goals?.length ? (
                <ul>
                  {goals.map((g) => (
                    <li key={g.id}>{g.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0">Non renseigné</p>
              )}
            </GrayCard>
            <CandidateExperiencesSectionCard
              candidacyId={candidacyId}
              experiences={candidacy.experiences.map((e) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startedAt: new Date(e.startedAt),
                duration: e.duration,
              }))}
            />
          </ul>
          <CandidacySummaryBottomButtons
            candidacyId={candidacyId}
            isCandidacyReoriented={!!candidacy.reorientationReason}
            isCandidacyArchived={candidacy.candidacyStatuses.some(
              (s) => s.isActive && s.status === "ARCHIVE",
            )}
            isCandidacyDroppedOut={!!candidacy.candidacyDropOut}
          />
        </>
      )}
    </>
  );
};

export default CandidacySummaryPage;
