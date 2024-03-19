import { TreeSelect, TreeSelectItem } from "@/components/tree-select";
import { isInterventionZoneIsFullySelectedWithoutDOM } from "@/utils";

export const ZoneInterventionReadOnly = ({
  onSiteDepartmentsOnRegions,
  remoteDepartmentsOnRegions,
}: {
  onSiteDepartmentsOnRegions: TreeSelectItem[];
  remoteDepartmentsOnRegions: TreeSelectItem[];
}) => {
  return (
    <fieldset className="mt-12 flex flex-col sm:flex-row gap-y-8 justify-between p-8 border mt-8 mb-16">
      <div className="flex flex-col gap-y-4 sm:gap-x-8 w-full">
        <legend>
          <h3>Zone d'intervention en présentiel</h3>
        </legend>
        <TreeSelect
          readonly
          fullHeight
          title=""
          label="Toute la France Métropolitaine"
          items={onSiteDepartmentsOnRegions}
          onClickSelectAll={() => {}}
          onClickItem={() => {}}
          toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
            onSiteDepartmentsOnRegions,
          )}
        />
      </div>

      <div className="flex flex-col gap-y-4 sm:gap-x-8 w-full">
        <legend>
          <h3>Zone d'intervention en distanciel</h3>
        </legend>
        <TreeSelect
          readonly
          fullHeight
          title=""
          label="Toute la France Métropolitaine"
          items={remoteDepartmentsOnRegions}
          onClickSelectAll={() => {}}
          onClickItem={() => {}}
          toggleButtonIsSelected={isInterventionZoneIsFullySelectedWithoutDOM(
            remoteDepartmentsOnRegions,
          )}
        />
      </div>
    </fieldset>
  );
};
