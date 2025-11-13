import { format, isAfter, toDate } from "date-fns";
import { useRouter } from "next/navigation";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";

import {
  CandidacyStatus,
  CandidacyStatusStep,
  FeasibilityDecision,
  JuryResult,
  OrganismModaliteAccompagnement,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

import { CandidacyTagsAap } from "../../candidacy-tags-aap/CandidacyTagsAap";

type Feasibility = {
  dematerializedFeasibilityFile?: {
    sentToCandidateAt?: number | null;
    isReadyToBeSentToCertificationAuthority: boolean;
    isReadyToBeSentToCandidate: boolean;
    candidateConfirmationAt?: number | null;
    swornStatementFileId?: string | null;
  } | null;
  decision?: FeasibilityDecision | null;
  feasibilityFileSentAt?: number | null;
} | null;

type Jury = {
  dateOfSession: number;
  result?: JuryResult | null;
} | null;

type Dropout = {
  createdAt: number;
} | null;

export const CandidacyCard = ({
  candidacyId,
  candidateFirstname,
  candidateFirstname2,
  candidateFirstname3,
  candidateLastname,
  candidateGivenName,
  certificationLabel,
  departmentLabel,
  departmentCode,
  organismLabel,
  organismModalitateAccompagnement,
  vaeCollective,
  vaeCollectiveCommanditaireLabel,
  vaeCollectiveProjetLabel,
  vaeCollectiveCohortLabel,
  typeAccompagnement,
  status,
  statusHistory,
  firstAppointmentOccuredAt,
  feasibility,
  readyForJuryEstimatedAt,
  jury,
  dropout,
}: {
  candidacyId: string;
  candidateFirstname: string;
  candidateFirstname2?: string;
  candidateFirstname3?: string;
  candidateLastname: string;
  candidateGivenName?: string;
  certificationLabel?: string;
  departmentLabel?: string;
  departmentCode?: string;
  organismLabel?: string;
  organismModalitateAccompagnement?: OrganismModaliteAccompagnement;
  candidacySentAt?: Date;
  vaeCollective?: boolean;
  vaeCollectiveCommanditaireLabel?: string;
  vaeCollectiveProjetLabel?: string;
  vaeCollectiveCohortLabel?: string;
  typeAccompagnement: TypeAccompagnement;
  status: CandidacyStatusStep;
  statusHistory: Omit<CandidacyStatus, "id">[];
  firstAppointmentOccuredAt?: Date;
  feasibility?: Feasibility;
  readyForJuryEstimatedAt?: Date;
  jury?: Jury;
  dropout?: Dropout;
}) => {
  const router = useRouter();

  const currentStatus = status;
  const previousStatus = statusHistory.sort((a, b) =>
    isAfter(a.createdAt, b.createdAt) ? 1 : -1,
  )[1]?.status;

  const validationStatus = statusHistory.find((s) => s.status === "VALIDATION");

  const candidacySentAt = validationStatus
    ? toDate(validationStatus.createdAt)
    : undefined;

  return (
    <WhiteCard
      key={candidacyId}
      className="gap-3 fr-card--shadow hover:bg-dsfr-light-neutral-grey-1000 cursor-pointer"
      onClick={() => {
        router.push(`/candidacies/${candidacyId}/summary`);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <CandidacyTagsAap
            currentStatus={currentStatus}
            previousStatus={previousStatus}
            typeAccompagnement={typeAccompagnement}
            firstAppointmentOccuredAt={firstAppointmentOccuredAt}
            readyForJuryEstimatedAt={readyForJuryEstimatedAt}
            organismModalitateAccompagnement={organismModalitateAccompagnement}
            vaeCollective={vaeCollective}
            jury={jury}
            feasibility={feasibility}
            dropout={dropout}
          />
        </div>

        {departmentLabel && departmentCode && (
          <div className="text-xs text-dsfrGray-mentionGrey">{`${departmentLabel} (${departmentCode})`}</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-bold text-xl text-dsfr-blue-france-sun-113">
          {candidateGivenName
            ? `${candidateGivenName} (${candidateLastname})`
            : candidateLastname}{" "}
          {candidateFirstname}
          {candidateFirstname2 && <span>, {candidateFirstname2}</span>}
          {candidateFirstname3 && <span>, {candidateFirstname3}</span>}
        </div>

        <p className="m-0 text-sm">
          {certificationLabel && (
            <span>
              {certificationLabel}
              <br />
            </span>
          )}

          {organismLabel && (
            <span>
              {organismLabel}
              <br />
            </span>
          )}

          {vaeCollectiveCommanditaireLabel && vaeCollectiveProjetLabel && (
            <span>
              {`${vaeCollectiveCommanditaireLabel} - ${vaeCollectiveProjetLabel}`}
              <br />
            </span>
          )}

          {vaeCollectiveCohortLabel && <span>{vaeCollectiveCohortLabel}</span>}
        </p>
      </div>

      <div className="flex flex-row gap-2 justify-between">
        <div className="text-xs text-dsfrGray-mentionGrey">
          {!!candidacySentAt &&
            `Envoyée le ${format(candidacySentAt, "dd MMMM yyyy")}`}
        </div>

        <span
          className="fr-icon--sm fr-icon-arrow-right-line text-dsfr-blue-france-sun-113"
          aria-hidden="true"
        ></span>
      </div>
    </WhiteCard>
  );
};
