import { OrganismModaliteAccompagnement } from "@/graphql/generated/graphql";
import Badge from "@codegouvfr/react-dsfr/Badge";

const accompagnementConfigMap = {
  A_DISTANCE: {
    dataTest: "badge-remote",
    className: "fr-badge--green-tilleul-verveine",
    value: "À distance",
  },
  LIEU_ACCUEIL: {
    dataTest: "badge-on-site",
    className: "fr-badge--beige-gris-galet",
    value: "Sur site",
  },
};

export const CandidacyModalities = ({
  fundable,
  modaliteAccompagnement,
  isCaduque,
  isCandidacyActualisationActive,
}: {
  fundable: boolean;
  modaliteAccompagnement: OrganismModaliteAccompagnement | undefined;
  isCaduque: boolean;
  isCandidacyActualisationActive: boolean;
}) => {
  const FundableBadge = () => (
    <Badge
      className={fundable ? "fr-badge--info" : "fr-badge--yellow-tournesol"}
      small
      noIcon
      data-test={fundable ? "badge-fundable" : "badge-not-fundable"}
    >
      {fundable ? "finançable France VAE" : "financement droit commun"}
    </Badge>
  );

  if (!modaliteAccompagnement) {
    return <FundableBadge />;
  }

  const accompagnementConfig = accompagnementConfigMap[modaliteAccompagnement];

  return (
    <div className="flex flex-wrap gap-3">
      <FundableBadge />
      <Badge
        small
        noIcon
        className={accompagnementConfig.className}
        data-test={accompagnementConfig.dataTest}
      >
        {accompagnementConfig.value}
      </Badge>
      {isCaduque && isCandidacyActualisationActive && (
        <Badge severity="error" data-test="caduque-badge">
          Recevabilité caduque
        </Badge>
      )}
    </div>
  );
};
