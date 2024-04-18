import { Button } from "@codegouvfr/react-dsfr/Button";

import { Department, Organism } from "../../../interface";
import { OrganismCardDescription } from "./OrganismCardDescription";
import { OrganismCardInformationsCommerciales } from "./OrganismCardInformationsCommerciales";
import { OrganismCardTitle } from "./OrganismCardTitle";

const getMandatoryInfo = (organism: Organism, department?: Department) => {
  const { informationsCommerciales: ic } = organism;
  return {
    label: ic?.nom || organism.label,
    website: ic?.siteInternet || organism.website,
    email: ic?.emailContact || organism.contactAdministrativeEmail,
    phone: ic?.telephone || organism.contactAdministrativePhone,
    location:
      department &&
      organism.organismOnDepartments?.find(
        (od) => od.departmentId === department.id
      ),
  };
};

export const OrganismCard = ({
  organism,
  department,
  onClick,
}: {
  organism: Organism;
  department?: Department;
  onClick: () => void;
}) => {
  let mandatoryInfo = getMandatoryInfo(organism, department);
  return (
    <div className="break-inside-avoid-column border border-dsfrGray-200 p-6 flex flex-col gap-y-4">
      <OrganismCardTitle
        label={mandatoryInfo.label}
        website={mandatoryInfo.website}
      />
      <div className="flex flex-col gap-y-3">
        <OrganismCardInformationsCommerciales
          informationsCommerciales={organism.informationsCommerciales}
        />
        <OrganismCardDescription
          email={mandatoryInfo.email}
          phone={mandatoryInfo.phone}
          location={mandatoryInfo.location}
        />
      </div>
      <div className="flex justify-end">
        <Button
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
