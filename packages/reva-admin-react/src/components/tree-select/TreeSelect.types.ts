export type TreeSelectItem = {
  id: string;
  label: string;
  selected: boolean;
  children?: TreeSelectItem[];
};
