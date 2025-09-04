import Tag from "@codegouvfr/react-dsfr/Tag";

import { OrganismModaliteAccompagnement } from "@/graphql/generated/graphql";

const accompagnementConfigMap = {
  A_DISTANCE: {
    dataTest: "tag-remote",
    value: "À distance",
    iconId: "fr-icon-headphone-fill" as const,
  },
  LIEU_ACCUEIL: {
    dataTest: "tag-on-site",
    value: "Sur site",
    iconId: "fr-icon-home-4-fill" as const,
  },
};

export const CandidacyModalities = ({
  fundable,
  modaliteAccompagnement,
}: {
  fundable: boolean;
  modaliteAccompagnement: OrganismModaliteAccompagnement | undefined;
}) => {
  const FundableBadge = () => (
    <Tag small data-test={fundable ? "tag-fundable" : "tag-not-fundable"}>
      {fundable ? "Finançable France VAE" : "Financement droit commun"}
    </Tag>
  );

  if (!modaliteAccompagnement) {
    return <FundableBadge />;
  }

  const accompagnementConfig = accompagnementConfigMap[modaliteAccompagnement];

  return (
    <div className="flex flex-wrap gap-1">
      <Tag
        small
        iconId={accompagnementConfig.iconId}
        data-test={accompagnementConfig.dataTest}
      >
        {accompagnementConfig.value}
      </Tag>
      <FundableBadge />
    </div>
  );
};
