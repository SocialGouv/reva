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
}: {
  organism: Organism;
  department?: Department;
}) => {
  let mandatoryInfo = getMandatoryInfo(organism, department);
  return (
    <div className="break-inside-avoid-column border p-4">
      <OrganismCardTitle
        label={mandatoryInfo.label}
        website={mandatoryInfo.website}
      />
      {organism.informationsCommerciales && (
        <OrganismCardInformationsCommerciales
          informationsCommerciales={organism.informationsCommerciales}
        />
      )}
      <OrganismCardDescription
        email={mandatoryInfo.email}
        phone={mandatoryInfo.phone}
        location={mandatoryInfo.location}
      />
    </div>
  );
};
