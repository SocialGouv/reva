import { DEPARTEMENTS_DOM } from "@/constants/departments.const";

interface Departement {
  departementId: string;
  departementLabel: string;
  isSelected: boolean;
  code: string;
}

interface Region {
  regionId: string;
  regionLabel: string;
  isSelected: boolean;
  departements: Departement[];
}

export const sortDepartmentsByAlphabeticalOrderAndDOM = (
  departmentsToSort: Region[],
) => {
  const departmentsSorted = [...departmentsToSort].sort((a, b) => {
    const hasDomDepartementA = a.departements.some((departement) =>
      DEPARTEMENTS_DOM.includes(departement.code),
    );
    const hasDomDepartementB = b.departements.some((departement) =>
      DEPARTEMENTS_DOM.includes(departement.code),
    );

    if (hasDomDepartementA && !hasDomDepartementB) {
      return 1;
    }

    if (!hasDomDepartementA && hasDomDepartementB) {
      return -1;
    }

    return a.regionLabel.localeCompare(b.regionLabel);
  });

  return departmentsSorted;
};
