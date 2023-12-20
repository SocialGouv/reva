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

export function checkIfAllItemsUnSelected(items: TreeSelectItem[]): boolean {
  const isSelected =
    items.length != 0 &&
    items.filter(
      (item) => !item.selected || !checkIfAllItemsSelected(item.children || []),
    ).length == items.length;

  return isSelected;
}

export function updateSelectedValueForAllItemsBasedOnValue(
  items: TreeSelectItem[],
  value: boolean,
): TreeSelectItem[] {
  const mappedItems = items.map((item) => ({
    ...item,
    selected: value,
    children: updateSelectedValueForAllItemsBasedOnValue(
      item.children || [],
      value,
    ),
  }));
  return mappedItems;
}

export function updateSelectedValueForAllItemsBasedOnItem(
  items: TreeSelectItem[],
  refItem: TreeSelectItem,
): TreeSelectItem[] {
  const mappedItems = items.map((item) => {
    const isItemEqualToRefItem = item.id == refItem.id;

    const mappedItem: TreeSelectItem = {
      ...item,
      selected: isItemEqualToRefItem ? !item.selected : item.selected,
    };

    let mappedChildren: TreeSelectItem[] = [];
    if (isItemEqualToRefItem) {
      mappedChildren = updateSelectedValueForAllItemsBasedOnValue(
        item.children || [],
        mappedItem.selected,
      );
    } else {
      mappedChildren = updateSelectedValueForAllItemsBasedOnItem(
        item.children || [],
        refItem,
      );
    }

    const isAllChildrenSelected = checkIfAllItemsSelected(mappedChildren || []);
    const isAllChildrenUnSelected = checkIfAllItemsUnSelected(
      mappedChildren || [],
    );

    if (isAllChildrenSelected) {
      mappedItem.selected = true;
    } else if (isAllChildrenUnSelected) {
      mappedItem.selected = false;
    } else if (
      mappedChildren.length > 0 &&
      !isAllChildrenSelected &&
      !isAllChildrenUnSelected
    ) {
      mappedItem.selected = false;
    }

    mappedItem.children = mappedChildren;

    return mappedItem;
  });

  return mappedItems;
}
