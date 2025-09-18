import { Button } from "@codegouvfr/react-dsfr/Button";

import { Organism } from "@/graphql/generated/graphql";

import { OrganismCardDescription } from "./OrganismCardDescription";
import { OrganismCardDistance } from "./OrganismCardDistance";
import { OrganismCardInformationsCommerciales } from "./OrganismCardInformationsCommerciales";
import { OrganismCardTitle } from "./OrganismCardTitle";

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

const FermePourAbsenceOuCongesButton = () => (
  <Button priority="tertiary no outline" size="small" disabled>
    Indisponible actuellement
  </Button>
);

export const OrganismCard = ({
  organism,
  onClick,
  isSelected,
}: {
  organism: Organism;
  onClick: () => void;
  isSelected?: boolean;
}) => {
  const mandatoryInfo = getMandatoryInfo(organism);
  const fermePourAbsenceOuConges = organism.fermePourAbsenceOuConges;

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
        {organism && (
          <OrganismCardInformationsCommerciales organism={organism} />
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
        {fermePourAbsenceOuConges ? (
          <FermePourAbsenceOuCongesButton />
        ) : (
          <Button
            data-test={`project-organisms-submit-organism-${organism.id}`}
            priority="secondary"
            size="small"
            nativeButtonProps={{ onClick }}
            disabled={isSelected}
            className={isSelected ? "shadow-none" : ""}
          >
            {isSelected ? "Sélectionné actuellement" : "Choisir"}
          </Button>
        )}
      </div>
    </div>
  );
};
