import { DEPARTMENTS_DOM } from "@/constants";
import {
  TreeSelectDepartment,
  TreeSelectRegion,
  ZoneInterventionList,
} from "@/types";

export const isInterventionZoneIsFullySelectedWithoutDOM = (
  zoneIntervention: ZoneInterventionList,
) => {
  const zoneInterventionWithoutDOM = zoneIntervention.filter(
    (region: TreeSelectRegion) =>
      !region.children?.some((department: TreeSelectDepartment) =>
        DEPARTMENTS_DOM.includes(department.code as string),
      ),
  );

  const isFullySelected = zoneInterventionWithoutDOM.every(
    (region: TreeSelectRegion) => region.selected,
  );

  return isFullySelected;
};
