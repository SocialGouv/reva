import {
  TreeSelect,
  updateSelectedValueForAllItemsBasedOnItem,
} from "@/components/tree-select";
import { DEPARTMENTS_DOM } from "@/constants";
import {
  TreeSelectDepartment,
  TreeSelectRegion,
  ZoneInterventionList,
} from "@/types";
import { isInterventionZoneIsFullySelectedWithoutDOM } from "@/utils";
import { useFormContext } from "react-hook-form";
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

function ZoneIntervention() {
  const { watch, setValue } = useFormContext();
  const zoneInterventionPresentiel = watch("zoneInterventionPresentiel");
  const zoneInterventionDistanciel = watch("zoneInterventionDistanciel");

  if (
    !zoneInterventionPresentiel?.length &&
    !zoneInterventionDistanciel?.length
  )
    return null;

  const onClickDepartmentItemPresentiel = (item: TreeSelectDepartment) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      zoneInterventionPresentiel,
      item,
    );

    setValue("zoneInterventionPresentiel", mappedDepartmentItems);
  };

  const onClickSelectAllDepartmentItemsPresentiel = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllRegions(
      zoneInterventionPresentiel,
      value,
    );

    setValue("zoneInterventionPresentiel", mappedDepartmentItems);
  };

  const onClickDepartmentItemDistanciel = (item: TreeSelectRegion) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      zoneInterventionDistanciel,
      item,
    );

    setValue("zoneInterventionDistanciel", mappedDepartmentItems);
  };

  const onClickSelectAllDepartmentItemsDistanciel = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllRegions(
      zoneInterventionDistanciel,
      value,
    );
    setValue("zoneInterventionDistanciel", mappedDepartmentItems);
  };

  return (
    <fieldset>
      <legend className="text-2xl font-bold mb-4">Zone d'intervention</legend>
      <div className="flex flex-col sm:flex-row gap-y-8 sm:gap-x-8">
        {!!zoneInterventionPresentiel?.length && (
          <TreeSelect
            title="Zone en présentiel"
            items={zoneInterventionPresentiel}
            label="Toute la France Métropolitaine"
            onClickItem={onClickDepartmentItemPresentiel}
            onClickSelectAll={onClickSelectAllDepartmentItemsPresentiel}
            toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
              zoneInterventionPresentiel,
            )}
          />
        )}
        {!!zoneInterventionDistanciel?.length && (
          <TreeSelect
            title="Zone en distanciel"
            items={zoneInterventionDistanciel}
            label="Toute la France Métropolitaine"
            onClickItem={onClickDepartmentItemDistanciel}
            onClickSelectAll={onClickSelectAllDepartmentItemsDistanciel}
            toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
              zoneInterventionDistanciel,
            )}
          />
        )}
      </div>
    </fieldset>
  );
}

export default ZoneIntervention;
