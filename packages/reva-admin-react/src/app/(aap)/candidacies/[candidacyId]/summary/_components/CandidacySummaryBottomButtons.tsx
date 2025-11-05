import { useAuth } from "@/components/auth/auth";

import { FinanceModule, TypeAccompagnement } from "@/graphql/generated/graphql";

import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";

import {
  AdminAction,
  AdminActionZone,
} from "./admin-action-zone/AdminActionZone";
import { EndAccompagnementTile } from "./admin-action-zone/EndAccompagnementTile";

export const CandidacySummaryBottomButtons = ({
  candidacyId,
  candidacy,
}: {
  candidacyId: string;
  candidacy: CandidacyForStatus & {
    financeModule: FinanceModule;
    typeAccompagnement: TypeAccompagnement;
  };
}) => {
  const {
    canBeArchived,
    canBeRestored,
    canDropout,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
    canEndAccompagnement,
  } = useCandidacyStatus(candidacy);

  const { isAdmin } = useAuth();

  return (
    <div className="mt-8 flex flex-col">
      {!isAdmin && (
        <>
          <div className="bg-white border border-b-2 mt-8">
            <p className="text-xl font-bold my-0 leading-loose p-4 pl-6">
              <span className="fr-icon-user-star-line fr-icon--lg mr-2" />
              Actions administratives
            </p>
          </div>
          {canEndAccompagnement && candidacy.endAccompagnementStatus && (
            <EndAccompagnementTile
              candidacyId={candidacyId}
              endAccompagnementStatus={candidacy.endAccompagnementStatus}
              endAccompagnementDate={candidacy.endAccompagnementDate}
            />
          )}
          {canBeArchived && (
            <AdminAction
              data-testid="archive-candidacy-button"
              title="Archiver la candidature"
              description="Le candidat pourra refaire une candidature dans le cadre de France VAE (modification du diplôme, changement d’AAP, …)"
              detail="Accessible jusqu’au dépôt du dossier de faisabilité."
              linkProps={{
                href: `/candidacies/${candidacyId}/archive`,
                target: "_self",
              }}
            />
          )}
        </>
      )}

      {isAdmin && (
        <AdminActionZone
          candidacyId={candidacyId}
          canBeArchived={canBeArchived}
          canBeRestored={canBeRestored}
          canCancelDropout={canCancelDropout}
          canDropout={canDropout}
          canSwitchFinanceModuleToHorsPlateforme={
            canSwitchFinanceModuleToHorsPlateforme
          }
          canSwitchTypeAccompagnementToAutonome={
            canSwitchTypeAccompagnementToAutonome
          }
          isAutonome={candidacy.typeAccompagnement === "AUTONOME"}
          isHorsPlateforme={candidacy.financeModule === "hors_plateforme"}
        />
      )}
    </div>
  );
};
