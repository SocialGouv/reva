import { TreeSelectItem } from "./TreeSelect.types";

export function getFilteredItems(
  search: string,
  items: TreeSelectItem[],
): TreeSelectItem[] {
  const filteredItems = items.reduce((acc, item) => {
    const isLabelContainSearch = !!item.label.match(new RegExp(search, "i"));
    const filteredChildren = item.children
      ? getFilteredItems(search, item.children)
      : [];

    if (filteredChildren.length > 0) {
      return [
        ...acc,
        {
          ...item,
          children: filteredChildren,
        },
      ];
    }

    if (isLabelContainSearch) {
      return [
        ...acc,
        {
          ...item,
          children: filteredChildren,
        },
      ];
    }

    return acc;
  }, [] as TreeSelectItem[]);

  return filteredItems;
}

export function checkIfAllItemsSelected(items: TreeSelectItem[]): boolean {
  const isSelected =
    items.length != 0 &&
    items.filter(
      (item) => item.selected || checkIfAllItemsSelected(item.children || []),
    ).length == items.length;

  return isSelected;
}
