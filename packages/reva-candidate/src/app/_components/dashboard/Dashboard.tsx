import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { isAfter } from "date-fns";
import { useMemo } from "react";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import { DashboardBanner } from "./DashboardBanner";
import { AapContactTile } from "./tiles/AapContactTile";
import { CertificationAuthorityContactTile } from "./tiles/CertificationAuthorityContactTile";
import { CertificationTile } from "./tiles/CertificationTile";
import { DossierValidationTile } from "./tiles/DossierValidationTile";
import { ExperiencesTile } from "./tiles/ExperiencesTile";
import { FeasibilityTile } from "./tiles/FeasibilityTile";
import { GoalsTile } from "./tiles/GoalsTile";
import { NoContactTile } from "./tiles/NoContactTile";
import { NoRendezVousTile } from "./tiles/NoRendezVousTile";
import { OrganismTile } from "./tiles/OrganismTile";
import { RendezVousPedagogiqueTile } from "./tiles/RendezVousPedagogiqueTile";
import { SubmitCandidacyTile } from "./tiles/SubmitCandidacyTile";
import TileGroup from "./tiles/TileGroup";
import { TrainingTile } from "./tiles/TrainingTile";
import { TypeAccompagnementTile } from "./tiles/TypeAccompagnementTile";

const Dashboard = () => {
  const { candidacy, candidacyAlreadySubmitted } = useCandidacyForDashboard();

  const hasSelectedCertification = useMemo(
    () => candidacy?.certification?.id !== undefined,
    [candidacy],
  );

  const hasCompletedGoals = useMemo(
    () => candidacy?.goals?.length > 0,
    [candidacy],
  );

  const hasCompletedExperience = useMemo(
    () => candidacy?.experiences?.length > 0,
    [candidacy],
  );

  const hasSelectedOrganism = useMemo(
    () => candidacy?.organism?.id !== undefined,
    [candidacy],
  );

  const canSubmitCandidacy = useMemo(
    () =>
      candidateCanSubmitCandidacyToAap(
        hasSelectedCertification,
        hasCompletedGoals,
        hasSelectedOrganism,
        hasCompletedExperience,
        candidacyAlreadySubmitted,
      ),
    [
      hasSelectedCertification,
      hasCompletedGoals,
      hasSelectedOrganism,
      hasCompletedExperience,
      candidacyAlreadySubmitted,
    ],
  );
  return (
    <div>
      <p className="text-xl">
        RNCP {candidacy.certification?.codeRncp} :{" "}
        {candidacy.certification?.label}
      </p>
      <DashboardBanner
        candidacy={candidacy}
        canSubmitCandidacy={canSubmitCandidacy}
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      />
      <div className="grid grid-flow-row lg:grid-flow-col grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-x-6 gap-y-8 mx-auto mt-20">
        <div className="col-span-1 lg:col-span-2 row-span-1 h-fit shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <div className="bg-white p-4 pl-6 border-b-2">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Compléter ma
              candidature
            </p>
          </div>
          <div
            className={`grid ${
              candidacy.typeAccompagnement === "ACCOMPAGNE"
                ? "md:grid-cols-3 grid-rows-2"
                : "md:grid-cols-2 grid-rows-1"
            }`}
          >
            <CertificationTile
              hasSelectedCertification={hasSelectedCertification}
            />
            <TypeAccompagnementTile
              typeAccompagnement={candidacy.typeAccompagnement}
            />
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <>
                <GoalsTile hasCompletedGoals={hasCompletedGoals} />
                <ExperiencesTile experiences={candidacy.experiences} />
                <OrganismTile hasSelectedOrganism={hasSelectedOrganism} />
                <SubmitCandidacyTile
                  candidacyAlreadySubmitted={candidacyAlreadySubmitted}
                  canSubmitCandidacy={canSubmitCandidacy}
                />
              </>
            )}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 row-span-1 h-fit shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <div className="bg-white p-4 pl-6 border-b-2">
            <p className="text-xl font-bold my-0 leading-loose inline-block">
              <span className="fr-icon-award-line" /> Suivre mon parcours
            </p>
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <span className="align-middle inline-block ml-2">
                {!candidacyAlreadySubmitted && (
                  <Badge severity="warning">Candidature non envoyée</Badge>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-flow-row md:grid-flow-col grid-rows-1">
            {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
              <TrainingTile
                candidacyStatus={candidacy.status}
                firstAppointmentOccuredAt={candidacy.firstAppointmentOccuredAt}
              />
            )}
            <FeasibilityTile
              feasibility={candidacy.feasibility}
              isCaduque={candidacy.isCaduque}
            />
            <DossierValidationTile />
          </div>
        </div>
        <div className="flex flex-col col-span-1 row-span-2 row-start-1 gap-y-8">
          <TileGroup
            icon="fr-icon-calendar-2-line"
            title="Mes prochains rendez-vous"
          >
            {candidacy.firstAppointmentOccuredAt &&
            isAfter(candidacy.firstAppointmentOccuredAt, new Date()) ? (
              <RendezVousPedagogiqueTile
                firstAppointmentOccuredAt={candidacy.firstAppointmentOccuredAt}
              />
            ) : (
              <NoRendezVousTile />
            )}
          </TileGroup>
          <TileGroup icon="fr-icon-team-line" title="Mes contacts">
            {!candidacy.organism &&
              !candidacy.feasibility?.certificationAuthority && (
                <NoContactTile />
              )}
            {candidacy.organism && (
              <AapContactTile organism={candidacy.organism} />
            )}
            {candidacy.feasibility?.certificationAuthority && (
              <CertificationAuthorityContactTile
                certificationAuthorityLabel={
                  candidacy.feasibility?.certificationAuthority.label
                }
                certificationAuthorityContactFullName={
                  candidacy.feasibility?.certificationAuthority
                    .contactFullName ?? ""
                }
                certificationAuthorityContactEmail={
                  candidacy.feasibility?.certificationAuthority.contactEmail ??
                  ""
                }
              />
            )}
          </TileGroup>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
