import { format } from "date-fns";

import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";

import { EndAccompagnementStatus } from "@/graphql/generated/graphql";

import { AdminAction } from "./AdminActionZone";

export const EndAccompagnementTile = ({
  candidacyId,
  endAccompagnementStatus,
  endAccompagnementDate,
}: {
  candidacyId: string;
  endAccompagnementStatus: EndAccompagnementStatus;
  endAccompagnementDate?: number | null;
}) => {
  const endAccompagnementPending = endAccompagnementStatus === "PENDING";

  const linkProps = {
    href: `/candidacies/${candidacyId}/end-accompagnement`,
    target: "_self",
  };

  if (endAccompagnementPending && endAccompagnementDate) {
    return (
      <AdminAction
        title={`Fin d’accompagnement déclarée le ${format(
          endAccompagnementDate,
          "dd/MM/yyyy",
        )}`}
        description="Le candidat aura toujours accès à son espace pour finaliser sa candidature de façon autonome."
        start={
          <CustomErrorBadge label="En attente de la validation du candidat" />
        }
        linkProps={linkProps}
      />
    );
  }

  return (
    <AdminAction
      title="Déclarer la fin de l'accompagnement du candidat"
      description="Le candidat aura toujours accès à son espace pour finaliser sa candidature de façon autonome."
      linkProps={linkProps}
    />
  );
};
