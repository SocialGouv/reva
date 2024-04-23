import {
  TreeSelect,
  TreeSelectItem,
  updateSelectedValueForAllItemsBasedOnItem,
} from "@/components/tree-select";
import { DEPARTMENTS_DOM } from "@/constants";
import { TreeSelectDepartment, ZoneInterventionList } from "@/types";
import { isInterventionZoneIsFullySelectedWithoutDOM } from "@/utils";

export const ZoneIntervention = ({
  zoneIntervention,
  onChange,
  type,
  disabled,
}: {
  zoneIntervention: TreeSelectItem[];
  onChange?(newValue: TreeSelectItem[]): void;
  type: "ON_SITE" | "REMOTE";
  disabled?: boolean;
}) => {
  const onClickDepartmentItem = (item: TreeSelectDepartment) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      zoneIntervention,
      item,
    );

    onChange?.(mappedDepartmentItems);
  };

  const onClickSelectAllDepartmentItems = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllRegions(
      zoneIntervention,
      value,
    );
    onChange?.(mappedDepartmentItems);
  };

  return (
    <TreeSelect
      title={type === "ON_SITE" ? "Zone en présentiel" : "Zone en distanciel"}
      items={zoneIntervention}
      label="Toute la France Métropolitaine"
      onClickItem={onClickDepartmentItem}
      onClickSelectAll={onClickSelectAllDepartmentItems}
      toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
        zoneIntervention,
      )}
      readonly={disabled}
    />
  );
};

const updateSelectedValueForAllRegions = (
  zoneInterventionInitial: ZoneInterventionList,
  value: boolean,
) =>
  zoneInterventionInitial.map((region) => {
    const isDom = region.children?.some((department) =>
      DEPARTMENTS_DOM.includes(department.code as string),
    );

    if (isDom) {
      const indexRegion = zoneInterventionInitial.findIndex(
        (regionItem) => regionItem.id === region.id,
      );
      const regionItem = zoneInterventionInitial[indexRegion];
      return regionItem;
    }

    const childrenUpdated = region.children?.map((department) => {
      return {
        ...department,
        selected: value,
      };
    });

    region.selected = value;
    region.children = childrenUpdated;
    return region;
  });
