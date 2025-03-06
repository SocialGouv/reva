import Button from "@codegouvfr/react-dsfr/Button";
import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";
import { useAuth } from "@/components/auth/auth";
import { FinanceModule, TypeAccompagnement } from "@/graphql/generated/graphql";
import { AdminActionZone } from "./admin-action-zone/AdminActionZone";

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
    canDroput,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
  } = useCandidacyStatus(candidacy);

  const { isAdmin } = useAuth();

  return (
    <div className="mt-8 flex flex-col">
      {canDroput && (
        <Button
          priority="secondary"
          className="ml-auto"
          linkProps={{
            href: `/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        >
          Déclarer l'abandon du candidat
        </Button>
      )}

      {isAdmin && (
        <AdminActionZone
          candidacyId={candidacyId}
          canBeArchived={canBeArchived}
          canBeRestored={canBeRestored}
          canCancelDropout={canCancelDropout}
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
