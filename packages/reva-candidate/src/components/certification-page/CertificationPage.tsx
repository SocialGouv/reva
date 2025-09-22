import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { CertificationJuryTypeOfModality } from "@/graphql/generated/graphql";

import DocumentationTab from "./tabs/DocumentationTab";
import { JuryTab } from "./tabs/JuryTab";
import { MetierTab } from "./tabs/MetierTab";
import { PreRequisitesTab } from "./tabs/PrerequisitesTab";
import { UsefulResources } from "./useful-resources/UserfulResources";

export const CertificationPage = async ({
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
    additionalInfo?: {
      dossierDeValidationLink?: string | null;
      dossierDeValidationTemplate?: {
        url: string;
        name: string;
        mimeType: string;
      } | null;
      linkToReferential?: string | null;
      linkToJuryGuide?: string | null;
      linkToCorrespondenceTable?: string | null;
      additionalDocuments?:
        | {
            url: string;
            name: string;
            mimeType: string;
          }[]
        | null;
      certificationExpertContactDetails?: string | null;
      certificationExpertContactPhone?: string | null;
      certificationExpertContactEmail?: string | null;
      usefulResources?: string | null;
    } | null;
  };
}) => (
  <>
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
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <Tile
          title={`Niveau ${certification.level}`}
          classes={{ content: "p-0" }}
          className="min-w-[282px] h-auto"
          small
          orientation="horizontal"
          imageSvg
          imageUrl="/candidat/images/pictograms/information.svg"
          imageAlt="icône information"
        />
        {certification.typeDiplome && (
          <Tile
            title={certification.typeDiplome}
            classes={{ content: "p-0" }}
            className="min-w-[282px] h-auto"
            small
            orientation="horizontal"
            imageSvg
            imageUrl="/candidat/images/pictograms/city-hall.svg"
            imageAlt="icône mairie"
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
        {
          label: "Documentation",
          content: (
            <DocumentationTab additionalInfo={certification.additionalInfo} />
          ),
        },
      ]}
    />
    <hr className="mt-12 mb-8 pb-1" />
    <UsefulResources />
  </>
);
