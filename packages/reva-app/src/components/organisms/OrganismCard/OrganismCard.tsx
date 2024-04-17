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
    <div className="break-inside-avoid-column border p-6 flex flex-col gap-y-5">
      <OrganismCardTitle
        label={mandatoryInfo.label}
        website={mandatoryInfo.website}
      />
      <div>
        {organism.informationsCommerciales ? (
          <OrganismCardInformationsCommerciales
            informationsCommerciales={organism.informationsCommerciales}
          />
        ) : (
          <div className="h-20 bg-gray-50 flex items-center justify-center text-gray-500 text-xs mb-4">
            Adresse non précisée
          </div>
        )}
        <OrganismCardDescription
          email={mandatoryInfo.email}
          phone={mandatoryInfo.phone}
          location={mandatoryInfo.location}
        />
      </div>
      <div className="flex justify-end">
        <Button priority="secondary" nativeButtonProps={{ onClick }}>
          Choisir
        </Button>
      </div>
    </div>
  );
};