import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { isFeatureActive } from "@/utils/featureFlipping";

import { CertificationJuryTypeOfModality } from "@/graphql/generated/graphql";

import { JuryTab } from "./tabs/JuryTab";
import { MetierTab } from "./tabs/MetierTab";
import { PreRequisitesTab } from "./tabs/PrerequisitesTab";
import { UsefulResources } from "./useful-resources/UserfulResources";

export const CertificationPageContent = async ({
  certification,
}: {
  certification: {
    id: string;
    label: string;
    isAapAvailable: boolean;
    codeRncp: string;
    typeDiplome?: string | null;
    level: number;
    rncpObjectifsContexte?: string | null;
    prerequisites: { id: string; label: string }[];
    juryTypeMiseEnSituationProfessionnelle?: CertificationJuryTypeOfModality | null;
    juryTypeSoutenanceOrale?: CertificationJuryTypeOfModality | null;
    juryEstimatedCost?: number | null;
    juryPlace?: string | null;
  };
}) => {
  const showVaeCollective = await isFeatureActive("VAE_COLLECTIVE");

  return (
    <div className="flex-1 flex pb-8 min-h-screen">
      <div className="flex-1 bg-white w-full mx-auto flex flex-col fr-container p-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <Breadcrumb
          className="!mt-0 !mb-3"
          currentPageLabel={certification?.label}
          segments={[
            {
              label: "Candidats",
              linkProps: {
                href: "/espace-candidat/",
              },
            },
          ]}
        />
        <div className="flex flex-col gap-4">
          <h1 data-testid="certification-label" className="m-0">
            {certification?.label}
          </h1>
          <div className="flex flex-row items-center gap-4">
            <span className="text-xs text-dsfrGray-mentionGrey">{`RNCP ${certification?.codeRncp}`}</span>

            <Tag small>
              {certification?.isAapAvailable
                ? "VAE en autonomie ou accompagnée"
                : "VAE en autonomie"}
            </Tag>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            <Tile
              title={certification.typeDiplome}
              classes={{ content: "p-0" }}
              className="w-[282px]"
              small
              orientation="horizontal"
              imageSvg
              imageUrl="/candidate-space/certifications/pictograms/city-hall.svg"
              imageAlt="icône mairie"
            />
            <Tile
              title={`Niveau ${certification.level}`}
              classes={{ content: "p-0" }}
              className="w-[282px]"
              small
              orientation="horizontal"
              imageSvg
              imageUrl="/candidate-space/certifications/pictograms/information.svg"
              imageAlt="icône information"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-12">
          <Button
            priority="primary"
            linkProps={{
              href: `/inscription-candidat/?certificationId=${certification?.id}`,
            }}
          >
            Choisir ce diplôme
          </Button>
          {showVaeCollective && (
            <Button
              priority="secondary"
              linkProps={{
                href: `/inscription-candidat/vae-collective/`,
              }}
            >
              Utiliser un code VAE collective
            </Button>
          )}
        </div>
        <Tabs
          className="mt-12"
          tabs={[
            {
              label: "Métier",
              isDefault: true,
              content: (
                <MetierTab
                  codeRncp={certification.codeRncp}
                  rncpObjectifsContexte={certification.rncpObjectifsContexte}
                />
              ),
            },
            {
              label: "Prérequis",
              content: (
                <PreRequisitesTab prerequisites={certification.prerequisites} />
              ),
            },
            {
              label: "Jury",
              content: (
                <JuryTab
                  juryTypeMiseEnSituationProfessionnelle={
                    certification.juryTypeMiseEnSituationProfessionnelle
                  }
                  juryTypeSoutenanceOrale={
                    certification.juryTypeSoutenanceOrale
                  }
                  juryEstimatedCost={certification.juryEstimatedCost}
                  juryPlace={certification.juryPlace}
                />
              ),
            },
          ]}
        />
        <hr className="mt-12 mb-8 pb-1" />
        <UsefulResources />
        <Button
          className="mt-12"
          priority="secondary"
          linkProps={{
            href: "/espace-candidat/",
          }}
        >
          Retour
        </Button>
      </div>
    </div>
  );
};
