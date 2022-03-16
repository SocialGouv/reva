import { Direction, Page } from "./interface";

const visible = { y: 0, scale: 1, opacity: 1 };

export const buttonVariants = {
  hidden: (page: Page) =>
    page === "show-results" ? { y: 120, scale: 0.98, opacity: 1 } : visible,
  visible,
};

export const pageVariants = {
  enter: (direction: Direction) => ({
    x: direction === "previous" ? -100 : "100%",
  }),
  visible: { x: 0 },
  exit: (direction: Direction) => ({
    x: direction === "previous" ? "100%" : -100,
  }),
};

export const pageTransition = { ease: "easeOut", duration: 0.2 };
