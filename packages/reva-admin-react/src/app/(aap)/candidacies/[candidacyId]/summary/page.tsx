"use client";
import { CandidateExperiencesSectionCard } from "@/app/(aap)/candidacies/[candidacyId]/summary/_components/CandidateExperiencesSectionCard";
import {
  formatStringToPhoneNumberStructure,
  formatStringToSocialSecurityNumberStructure,
} from "@/utils";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import CandidacySectionCard from "./_components/CandidacySectionCard";
import { checkCandidateFields } from "./_components/checkCandidateFields";
import useCandidateSummary from "./_components/useCandidateSummary";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useHooksAccount } from "./summary.hooks";
import { useAuth } from "@/components/auth/auth";
import { CopyClipBoard } from "@/components/copy-clip-board";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { GrayCard } from "@/components/card/gray-card/GrayCard";

const BadgeCompleted = () => <Badge severity="success">Complété</Badge>;

const BadgeToComplete = () => <Badge severity="warning">À compléter</Badge>;

const CandidacySummaryPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();

  const { isFeatureActive } = useFeatureflipping();
  const { isAdmin } = useAuth();
  const { getImpersonateUrl } = useHooksAccount();
  const { candidacy } = useCandidateSummary(candidacyId);

  if (!candidacy) return null;

  const { candidate, certification, admissibilityFvae } = candidacy;

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

          {isFeatureActive("IMPERSONATE") && isAdmin && (
            <CopyClipBoard
              onClick={async (callback) => {
                const url = await getImpersonateUrl(candidacy.candidate?.id);
                if (url) {
                  callback(url);
                }
              }}
            >
              <Button priority="secondary" type="button">
                Impersonate
              </Button>
            </CopyClipBoard>
          )}
        </div>

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
            badge={
              isCandidateInformationCompleted ? (
                <BadgeCompleted />
              ) : (
                <BadgeToComplete />
              )
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
            badge={
              isCandidateProfileCompleted ? (
                <BadgeCompleted />
              ) : (
                <BadgeToComplete />
              )
            }
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
          </CandidacySectionCard>
          <GrayCard>
            <h4>La certification choisie</h4>
            {certification ? (
              <>
                <h6 className="mb-2">{certification.label}</h6>
                <p className="text-xs text-gray-600 mb-0">
                  RNCP {certification.codeRncp}
                </p>
              </>
            ) : (
              <p className="mb-0">Aucune certification</p>
            )}
          </GrayCard>
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
                <Badge severity="warning">Recevabilité favorable expirée</Badge>
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
      )}
    </>
  );
};

export default CandidacySummaryPage;
