import { TreeSelectItem } from "@/components/tree-select";

export interface TreeSelectDepartment extends TreeSelectItem {
  code?: string;
}
export interface TreeSelectRegion extends TreeSelectItem {
  children?: TreeSelectDepartment[];
}

export type ZoneInterventionList = TreeSelectRegion[];
