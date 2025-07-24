import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";

import type { DropAnimation } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export function SortableOverlay({ children }: PropsWithChildren<object>) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}
