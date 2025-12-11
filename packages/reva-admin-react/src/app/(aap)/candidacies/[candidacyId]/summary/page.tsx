"use client";

import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { toDate } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { CandidacySummaryBottomButtons } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidacySummaryBottomButtons";
import { CandidateExperiencesSectionCard } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidateExperiencesSectionCard";
import { useTakeOverCandidacy } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/takeOverCondidacy";
import { useAuth } from "@/components/auth/auth";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Impersonate } from "@/components/impersonate/Impersonate.component";
import { formatIso8601Date } from "@/utils/formatIso8601Date";

import { CertificationCard } from "../_components/CertificationCard";

import { checkCandidateFields } from "./_components/checkCandidateFields";
import useCandidateSummary from "./_components/useCandidateSummary";

const CandidacySummaryPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, certificationAuthorityStructure } =
    useCandidateSummary(candidacyId);

  const { takeOverCandidacy } = useTakeOverCandidacy();

  const { isAdmin } = useAuth();

  //mark the candidacy as "taken over" when the AAP opens it
  useEffect(() => {
    if (candidacy) {
      if (candidacy.status === "VALIDATION") {
        takeOverCandidacy({
          candidacyId: candidacy.id,
          candidacyActiveStatus: candidacy.status,
        });
      }
    }
  }, [candidacy, takeOverCandidacy]);

  if (!candidacy) return null;

  const { candidate, goals } = candidacy;

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

  const showFundingAlert = candidacy.financeModule === "hors_plateforme";

  const isCandidateEditable =
    candidacy.feasibilityFormat === "DEMATERIALIZED" &&
    (!candidacy.feasibility?.feasibilityFileSentAt ||
      candidacy.feasibility?.decision === "INCOMPLETE");

  const canViewCertificationAuthorityProfile =
    isAdmin && certificationAuthorityStructure;

  return (
    <>
      <div>
        <div className="flex justify-between mb-1">
          <h1>Résumé de la candidature</h1>

          {isAdmin && (
            <Button
              priority="secondary"
              type="button"
              className="h-[38px]"
              onClick={() => {
                window.open(
                  `${process.env.NEXT_PUBLIC_CANDIDATE_REACT_URL}/candidates/${candidacy.candidate?.id}/candidacies/${candidacy.id}`,
                  "_blank",
                );
              }}
            >
              Espace candidat
            </Button>
          )}

          <Impersonate candidateId={candidacy.candidate?.id} />
        </div>

        <p>
          Vous pouvez compléter ou modifier ces informations jusqu'à l'envoi du
          dossier de faisabilité.
        </p>
        {showFundingAlert && (
          <Alert
            data-testid="funding-request-not-available-alert"
            severity="warning"
            title="Ce parcours n’est plus finançable via France VAE "
            description={
              <div>
                <p>
                  En revanche, il peut en partie être financé par le Compte
                  Personnel de Formation du candidat.
                </p>
                <p>
                  Ce dernier peut consulter ses droits depuis la plateforme Mon
                  Compte Formation.
                </p>
              </div>
            }
          />
        )}
      </div>
      {!!candidate && (
        <>
          <ul className="flex flex-col gap-8 pl-0 mt-8">
            <CertificationCard candidacy={candidacy} />

            <EnhancedSectionCard
              data-testid="candidate-information"
              title="Les informations du candidat"
              buttonOnClickHref={`/candidacies/${candidacyId}/summary/candidate-information`}
              status={
                isCandidateInformationCompleted ? "COMPLETED" : "TO_COMPLETE"
              }
              isEditable={isCandidateEditable || isAdmin}
            >
              <dl>
                <dt className="sr-only">Prénom et nom</dt>
                <dd>
                  {candidate.givenName
                    ? `${candidate.givenName} (${candidate.lastname})`
                    : candidate?.lastname}{" "}
                  {candidate.firstname}
                </dd>
                <dt className="sr-only">
                  Date de naissance, département et nationalité
                </dt>
                <dd>
                  {candidate.birthdate &&
                    `${formatIso8601Date(candidate.birthdate)} `}
                  {candidate.birthDepartment &&
                    `${candidate.birthDepartment.label} (${candidate.birthDepartment.code}) `}
                  {candidate.nationality}
                </dd>
                <dt className="sr-only">Adresse</dt>
                <dd>
                  {candidateHasAddressCompleted &&
                    `${candidacy.candidateInfo?.street}, ${candidacy.candidateInfo?.zip} ${candidacy.candidateInfo?.city}, ${candidate.department.label}`}
                </dd>
              </dl>
            </EnhancedSectionCard>

            <EnhancedSectionCard
              data-testid="candidate-contact-details"
              title="Les coordonnées du candidat"
              buttonOnClickHref={`/candidacies/${candidacyId}/summary/candidate-contact-details`}
              isEditable
            >
              <p
                className="mb-0 font-medium"
                data-testid="candidate-contact-details-phone"
              >
                {candidate.phone}
              </p>
              <p
                className="mb-0 font-medium"
                data-testid="candidate-contact-details-email"
              >
                {candidate.email}
              </p>
            </EnhancedSectionCard>
            {candidacy.feasibilityFormat === "DEMATERIALIZED" && (
              <EnhancedSectionCard
                data-testid="candidate-profile"
                title="Son profil"
                buttonOnClickHref={`/candidacies/${candidacyId}/summary/candidate-profile`}
                isEditable={isCandidateEditable}
                status={
                  isCandidateProfileCompleted ? "COMPLETED" : "TO_COMPLETE"
                }
              >
                {isCandidateProfileCompleted && (
                  <div className="flex flex-col">
                    <p className="font-bold mb-0">
                      Niveau de la formation la plus élevée
                    </p>
                    <p className="mb-2">
                      {candidate.niveauDeFormationLePlusEleve?.level}
                    </p>
                    <p className="mb-0 font-bold">
                      Niveau de la certification obtenue la plus élevée
                    </p>
                    <p className="mb-2">{candidate.highestDegree?.level}</p>
                    {candidate.highestDegreeLabel && (
                      <>
                        <p className="font-bold mb-0">
                          Intitulé de la certification la plus élevée obtenue
                        </p>
                        <p className="mb-2">{candidate.highestDegreeLabel}</p>
                      </>
                    )}
                  </div>
                )}
              </EnhancedSectionCard>
            )}
            <EnhancedSectionCard
              title="Certificateur"
              {...(canViewCertificationAuthorityProfile && {
                customButtonTitle: "Voir son profil",
                isEditable: true,
                buttonOnClickHref: `/certification-authority-structures/${certificationAuthorityStructure.id}/certificateurs-administrateurs/${candidacy.feasibility?.certificationAuthority?.id}/`,
              })}
            >
              <div className="ml-10 mr-6">
                <p className="text-xl font-bold mb-0 leading-loose">
                  {candidacy.feasibility?.certificationAuthority?.label}
                </p>
                <div>
                  {candidacy.certificationAuthorityLocalAccounts &&
                  candidacy.certificationAuthorityLocalAccounts.length > 0 ? (
                    candidacy.certificationAuthorityLocalAccounts.map(
                      (account, i) => (
                        <p
                          key={i}
                          className="mb-4 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-4"
                          data-testid={`certification-authority-local-account-${i}`}
                        >
                          {account?.contactFullName} <br />
                          {account?.contactEmail} <br />
                          {account?.contactPhone}
                        </p>
                      ),
                    )
                  ) : (
                    <p>
                      {
                        candidacy.feasibility?.certificationAuthority
                          ?.contactFullName
                      }
                      <br />
                      {
                        candidacy.feasibility?.certificationAuthority
                          ?.contactEmail
                      }
                      <br />
                      {
                        candidacy.feasibility?.certificationAuthority
                          ?.contactPhone
                      }
                    </p>
                  )}
                </div>
              </div>
            </EnhancedSectionCard>

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
            {isAdmin && (
              <GrayCard>
                <div className="flex flex-row justify-between mb-5">
                  <span className="text-2xl font-bold">
                    Son Architecte Accompagnateur de Parcours
                  </span>

                  {candidacy.organism?.maisonMereAAP?.id && (
                    <>
                      {candidacy.financeModule == "hors_plateforme" && (
                        <Button
                          priority="tertiary no outline"
                          linkProps={{
                            href: `/candidacies/${candidacy.id}/changement-aap`,
                          }}
                        >
                          Modifier
                        </Button>
                      )}

                      <Button
                        priority="secondary"
                        linkProps={{
                          href: `/maison-mere-aap/${candidacy.organism?.maisonMereAAP?.id}`,
                        }}
                      >
                        Voir son profil
                      </Button>
                    </>
                  )}
                </div>
                {candidacy.organism ? (
                  <>
                    <p className="mb-0">
                      {candidacy.organism.nomPublic || candidacy.organism.label}
                    </p>
                    <p className="mb-0">
                      {candidacy.organism.emailContact ||
                        candidacy.organism.contactAdministrativeEmail}
                    </p>
                  </>
                ) : (
                  <p className="mb-0">Pas encore d'AAP sélectionné</p>
                )}
              </GrayCard>
            )}
            <CandidateExperiencesSectionCard
              candidacyId={candidacyId}
              isEditable={candidacy.feasibilityFormat === "DEMATERIALIZED"}
              experiences={candidacy.experiences.map((e) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startedAt: toDate(e.startedAt),
                duration: e.duration,
              }))}
            />
          </ul>
          <CandidacySummaryBottomButtons
            candidacyId={candidacyId}
            candidacy={candidacy}
          />
        </>
      )}
    </>
  );
};

export default CandidacySummaryPage;
