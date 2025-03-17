import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { MetierTab } from "./tabs/MetierTab";
import { UsefulResources } from "./useful-resources/UserfulResources";

export const CertificationPageV2 = ({
  isHomePageV2FeatureActive,
  certification,
}: {
  isHomePageV2FeatureActive: boolean;
  certification: {
    id: string;
    label: string;
    isAapAvailable: boolean;
    codeRncp: string;
    typeDiplome?: string | null;
    level: number;
  };
}) => (
  <div className="flex-1 flex pb-8 min-h-screen">
    <div className="flex-1 bg-white w-full mx-auto flex flex-col fr-container p-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
      <Breadcrumb
        className="!mt-0 !mb-3"
        currentPageLabel={certification?.label}
        segments={[
          {
            label: "Candidats",
            linkProps: {
              href: isHomePageV2FeatureActive ? "/espace-candidat/" : "/",
            },
          },
        ]}
      />
      <div className="flex flex-col gap-4">
        <h1 className="m-0">{certification?.label}</h1>
        <div className="flex flex-row items-center gap-4">
          <span className="text-xs text-dsfrGray-mentionGrey">{`RNCP ${certification?.codeRncp}`}</span>

          <Tag small>
            {certification?.isAapAvailable
              ? "VAE en autonomie ou accompagnée"
              : "VAE en autonomie"}
          </Tag>
        </div>
        <div className="flex gap-6 mt-8">
          <Tile
            title={certification.typeDiplome}
            className="w-[282px] h-[98px]"
            small
            orientation="horizontal"
            imageSvg
            imageUrl="/candidate-space/certifications/pictograms/city-hall.svg"
            imageAlt="icône mairie"
          />
          <Tile
            title={`Niveau ${certification.level}`}
            desc={getLevelDesc(certification.level)}
            className="w-[282px] h-[98px]"
            small
            orientation="horizontal"
            imageSvg
            imageUrl="/candidate-space/certifications/pictograms/information.svg"
            imageAlt="icône information"
          />
        </div>
      </div>

      <Button
        className="mt-12"
        priority="primary"
        linkProps={{
          href: `/inscription-candidat/?certificationId=${certification?.id}`,
        }}
      >
        Choisir ce diplôme
      </Button>
      <Tabs
        className="mt-12"
        tabs={[
          {
            label: "Métier",
            isDefault: true,
            content: <MetierTab codeRncp={certification.codeRncp} />,
          },
        ]}
      />
      <hr className="mt-12 mb-8 pb-1" />
      <UsefulResources />
    </div>
  </div>
);

const getLevelDesc = (level: number) => {
  switch (level) {
    case 1:
      return "Sans qualification";
    case 2:
      return "Cléa";
    case 3:
      return "CAP, BEP";
    case 4:
      return "Baccalauréat";
    case 5:
      return "Bac + 2";
    case 6:
      return "Bac + 3 et Bac + 4";
    case 7:
      return "Bac + 5";
    case 8:
      return "Bac + 8";
    default:
      return "";
  }
};
