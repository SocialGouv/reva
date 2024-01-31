import { TreeSelectItem } from "@/components/tree-select";

// Transform department and region data
// into the generic TreeSelectItem format used in the TreeSelect component
export function toSelectedRegionAndDepartmentsItem(
  selectedDepartments: { id: string }[],
) {
  const toSelectedItem =
    (selectedDepartments: { id: string }[]) =>
    (d: { id: string; label: string; code: string }): TreeSelectItem => ({
      id: d.id,
      label: `${d.label} (${d.code})`,
      selected: selectedDepartments.some((sd) => sd.id === d.id),
    });

  return (region: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }): TreeSelectItem => ({
    id: region.id,
    label: region.label,
    children: region.departments.map(toSelectedItem(selectedDepartments)),
    selected: region.departments.every((d) =>
      selectedDepartments.some((sd) => sd.id === d.id),
    ),
  });
}
