import React from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import "./SortableList.css";

import { DragHandle, SortableItem, SortableOverlay } from "./components";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange?(items: T[]): void;
  onItemMoved?(fromIndex: number, toIndex: number): void;
  renderItem(item: T, itemIndex: number): ReactNode;
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  onItemMoved,
  renderItem,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange?.(arrayMove(items, activeIndex, overIndex));
          onItemMoved?.(activeIndex, overIndex);
        }
      }}
    >
      <SortableContext items={items}>
        <div className="SortableList" role="application">
          {items.map((item, itemIndex) => (
            <React.Fragment key={item.id}>
              {renderItem(item, itemIndex)}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
      <SortableOverlay />
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
