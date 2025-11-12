import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";

import {
  CandidacyStatusStep,
  FeasibilityDecision,
  JuryResult,
  OrganismModaliteAccompagnement,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

import { CandidacyStatuses } from "../candidacy-statuses/CandidacyStatuses";

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
  certificationLabel,
  organismLabel,
  organismModalitateAccompagnement,
  candidacySentAt,
  vaeCollective,
  vaeCollectiveCommanditaireLabel,
  vaeCollectiveProjetLabel,
  vaeCollectiveCohortLabel,
  currentStatus,
  previousStatus,
  firstAppointmentOccuredAt,
  feasibility,
  readyForJuryEstimatedAt,
  jury,
  dropout,
  typeAccompagnement,
}: {
  candidacyId: string;
  certificationLabel?: string;
  organismLabel?: string;
  organismModalitateAccompagnement?: OrganismModaliteAccompagnement;
  candidacySentAt?: Date;
  vaeCollective?: boolean;
  vaeCollectiveCommanditaireLabel?: string;
  vaeCollectiveProjetLabel?: string;
  vaeCollectiveCohortLabel?: string;
  currentStatus: CandidacyStatusStep;
  previousStatus?: CandidacyStatusStep;
  firstAppointmentOccuredAt?: Date;
  feasibility?: Feasibility;
  readyForJuryEstimatedAt?: Date;
  jury?: Jury;
  dropout?: Dropout;
  typeAccompagnement: TypeAccompagnement;
}) => {
  const router = useRouter();

  return (
    <WhiteCard
      key={candidacyId}
      className="gap-3 fr-card--shadow hover:bg-dsfr-light-neutral-grey-1000 cursor-pointer"
      onClick={() => {
        router.push(`./${candidacyId}`);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <CandidacyStatuses
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-bold text-xl text-dsfr-blue-france-sun-113">
          {certificationLabel}
        </div>

        <p className="m-0 text-sm">
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
            `Candidature envoyée le ${format(candidacySentAt, "dd MMMM yyyy")}`}
        </div>

        <span
          className="fr-icon--sm fr-icon-arrow-right-line text-dsfr-blue-france-sun-113"
          aria-hidden="true"
        ></span>
      </div>
    </WhiteCard>
  );
};
