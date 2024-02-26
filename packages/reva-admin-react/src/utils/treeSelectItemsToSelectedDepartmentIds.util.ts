import { TreeSelectItem } from "@/components/tree-select";

export function treeSelectItemsToSelectedDepartmentIds(
  treeSelectItems: TreeSelectItem[],
): string[] {
  return treeSelectItems.reduce((acc, region) => {
    const ids = (region.children || []).reduce((acc, department) => {
      if (department.selected) {
        return [...acc, department.id];
      }

      return acc;
    }, [] as string[]);

    return [...acc, ...ids];
  }, [] as string[]);
}
