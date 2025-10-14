import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { CertificationJuryTypeOfModality } from "@/graphql/generated/graphql";

import { BackButton } from "../back-button/BackButton";

import { SelectCertificationButton } from "./select-certification-button/SelectCertificationButton";
import { JuryTab } from "./tabs/JuryTab";
import { MetierTab } from "./tabs/MetierTab";
import { PreRequisitesTab } from "./tabs/PrerequisitesTab";

export const CertificationPageContent = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  certification,
  certificationSelectionDisabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
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
  certificationSelectionDisabled?: boolean;
}) => (
  <div className="flex-1 flex">
    <div className="flex flex-col">
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
            imageUrl="/vae-collective/certifications/pictograms/city-hall.svg"
            imageAlt="icône mairie"
          />
          <Tile
            title={`Niveau ${certification.level}`}
            classes={{ content: "p-0" }}
            className="w-[282px]"
            small
            orientation="horizontal"
            imageSvg
            imageUrl="/vae-collective/certifications/pictograms/information.svg"
            imageAlt="icône information"
          />
          {!certificationSelectionDisabled && (
            <SelectCertificationButton
              className="ml-auto mt-auto"
              commanditaireVaeCollectiveId={commanditaireId}
              cohorteVaeCollectiveId={cohorteVaeCollectiveId}
              certificationId={certification.id}
            />
          )}
        </div>
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
                juryTypeSoutenanceOrale={certification.juryTypeSoutenanceOrale}
                juryEstimatedCost={certification.juryEstimatedCost}
                juryPlace={certification.juryPlace}
              />
            ),
          },
        ]}
      />

      <div className="flex justify-between mt-12">
        <BackButton />
        {!certificationSelectionDisabled && (
          <SelectCertificationButton
            commanditaireVaeCollectiveId={commanditaireId}
            cohorteVaeCollectiveId={cohorteVaeCollectiveId}
            certificationId={certification.id}
          />
        )}
      </div>
    </div>
  </div>
);
