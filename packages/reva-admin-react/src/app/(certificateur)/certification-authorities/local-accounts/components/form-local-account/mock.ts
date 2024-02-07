import { TreeSelectItem } from "@/components/tree-select";

export const mockedItems: TreeSelectItem[] = [
  {
    id: "1",
    label: "Label 1",
    selected: false,
    children: [
      {
        id: "1-1",
        label: "Label 1-1",
        selected: false,
        children: [],
      },
      {
        id: "2-1",
        label: "Label 2-1",
        selected: false,
        children: [
          {
            id: "1-1-2",
            label: "Label 1-1-2",
            selected: false,
            children: [],
          },
          {
            id: "2-1-2",
            label: "Label 2-1-2",
            selected: false,
            children: [],
          },
          {
            id: "3-1-2",
            label: "Label 3-1-2",
            selected: false,
            children: [],
          },
        ],
      },
      {
        id: "3-1",
        label: "Label 3-1",
        selected: false,
        children: [],
      },
    ],
  },
  {
    id: "2",
    label: "Label 2",
    selected: false,
    children: [
      {
        id: "1-2",
        label: "Label 1-2",
        selected: false,
        children: [],
      },
      {
        id: "2-2",
        label: "Label 2-2",
        selected: false,
        children: [],
      },
      {
        id: "3-2",
        label: "Label 3-2",
        selected: false,
        children: [],
      },
    ],
  },
  {
    id: "3",
    label: "Label 3",
    selected: false,
    children: [
      {
        id: "1-3",
        label: "Label 1-3",
        selected: false,
        children: [],
      },
      {
        id: "2-3",
        label: "Label 2-3",
        selected: false,
        children: [],
      },
      {
        id: "3-3",
        label: "Label 3-3",
        selected: false,
        children: [],
      },
    ],
  },
];
