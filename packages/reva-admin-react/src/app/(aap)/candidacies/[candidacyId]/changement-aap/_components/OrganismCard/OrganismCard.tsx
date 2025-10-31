import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  ConformiteNormeAccessibilite,
  OrganismModaliteAccompagnement,
} from "@/graphql/generated/graphql";

import { OrganismCardDescription } from "./OrganismCardDescription";
import { OrganismCardDistance } from "./OrganismCardDistance";
import { OrganismCardInformationsCommerciales } from "./OrganismCardInformationsCommerciales";
import { OrganismCardTitle } from "./OrganismCardTitle";

type Organism = {
  id: string;
  label: string;
  contactAdministrativeEmail: string;
  contactAdministrativePhone?: string | null;
  modaliteAccompagnement: OrganismModaliteAccompagnement;
  website?: string | null;
  distanceKm?: number | null;
  isMaisonMereMCFCompatible?: boolean | null;
  nomPublic?: string | null;
  telephone?: string | null;
  siteInternet?: string | null;
  emailContact?: string | null;
  adresseNumeroEtNomDeRue?: string | null;
  adresseInformationsComplementaires?: string | null;
  adresseCodePostal?: string | null;
  adresseVille?: string | null;
  conformeNormesAccessibilite?: ConformiteNormeAccessibilite | null;
};

const getMandatoryInfo = (organism: Organism) => {
  const { nomPublic, siteInternet, emailContact, telephone } = organism;
  const isOnSite = organism.modaliteAccompagnement === "LIEU_ACCUEIL";
  const isRemote = organism.modaliteAccompagnement === "A_DISTANCE";

  return {
    label: nomPublic || organism.label,
    website: siteInternet || organism.website,
    email: emailContact || organism.contactAdministrativeEmail,
    phone: telephone || organism.contactAdministrativePhone,
    isOnSite,
    isRemote,
  };
};

export const OrganismCard = ({
  organism,
  onClick,
}: {
  organism: Organism;
  onClick: () => void;
}) => {
  const mandatoryInfo = getMandatoryInfo(organism);

  return (
    <div
      data-testid={`project-organisms-organism-${organism.id}`}
      className="break-inside-avoid-column border border-dsfrGray-200 p-6 flex flex-col gap-y-4"
    >
      <OrganismCardTitle
        label={mandatoryInfo.label}
        website={mandatoryInfo.website ?? undefined}
      />
      <div className="flex flex-col gap-y-3">
        <OrganismCardInformationsCommerciales organism={organism} />

        <OrganismCardDescription
          email={mandatoryInfo.email}
          phone={mandatoryInfo.phone ?? null}
          isOnSite={mandatoryInfo.isOnSite}
          isRemote={mandatoryInfo.isRemote}
          isMCFCompatible={!!organism.isMaisonMereMCFCompatible}
        />
      </div>
      <div className="flex justify-between">
        <div>
          <OrganismCardDistance distanceKm={organism.distanceKm} />
        </div>
        <Button
          data-testid={`project-organisms-submit-organism-${organism.id}`}
          priority="secondary"
          size="small"
          nativeButtonProps={{ onClick }}
        >
          Choisir
        </Button>
      </div>
    </div>
  );
};
