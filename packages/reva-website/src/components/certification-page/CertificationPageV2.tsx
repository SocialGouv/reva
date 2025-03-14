import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

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
  };
}) => (
  <div className="flex-1 flex pb-8 min-h-screen">
    <div className="flex-1 bg-white w-full mx-auto flex flex-col gap-8 fr-container p-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
      <Breadcrumb
        className="!mt-0 !-mb-2"
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
      </div>

      <Button
        priority="primary"
        linkProps={{
          href: `/inscription-candidat/?certificationId=${certification?.id}`,
        }}
      >
        Choisir ce diplôme
      </Button>
    </div>
  </div>
);
