import { Button } from "@codegouvfr/react-dsfr/Button";

import { Organism } from "@/graphql/generated/graphql";

import { OrganismCardDescription } from "./OrganismCardDescription";
import { OrganismCardDistance } from "./OrganismCardDistance";
import { OrganismCardInformationsCommerciales } from "./OrganismCardInformationsCommerciales";
import { OrganismCardTitle } from "./OrganismCardTitle";

const getMandatoryInfo = (organism: Organism) => {
  const { informationsCommerciales: ic } = organism;
  const isOnSite = organism.isOnSite;
  const isRemote = organism.isRemote;

  return {
    label: ic?.nom || organism.label,
    website: ic?.siteInternet || organism.website,
    email: ic?.emailContact || organism.contactAdministrativeEmail,
    phone: ic?.telephone || organism.contactAdministrativePhone,
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
      data-test={`project-organisms-organism-${organism.id}`}
      className="break-inside-avoid-column border border-dsfrGray-200 p-6 flex flex-col gap-y-4"
    >
      <OrganismCardTitle
        label={mandatoryInfo.label}
        website={mandatoryInfo.website ?? undefined}
      />
      <div className="flex flex-col gap-y-3">
        {organism.informationsCommerciales && (
          <OrganismCardInformationsCommerciales
            informationsCommerciales={organism.informationsCommerciales}
          />
        )}
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
          data-test={`project-organisms-submit-organism-${organism.id}`}
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
