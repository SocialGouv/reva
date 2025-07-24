import { ZoneInterventionList } from "../types/interventionZone.type";

import { DEPARTMENTS_DOM } from "@/constants";

export const sortDepartmentsByAlphabeticalOrderAndDOM = (
  departmentsToSort: ZoneInterventionList,
) => {
  const departmentsSorted = [...departmentsToSort].sort((a, b) => {
    const hasDomDepartementA = a.children?.some((departement) =>
      DEPARTMENTS_DOM.includes(departement.code as string),
    );
    const hasDomDepartementB = b.children?.some((departement) =>
      DEPARTMENTS_DOM.includes(departement.code as string),
    );

    if (hasDomDepartementA && !hasDomDepartementB) {
      return 1;
    }

    if (!hasDomDepartementA && hasDomDepartementB) {
      return -1;
    }

    return a.label.localeCompare(b.label);
  });

  return departmentsSorted;
};
