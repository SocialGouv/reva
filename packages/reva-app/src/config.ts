import { Page } from "./components/organisms/Page";

const visible = { y: 0, scale: 1, opacity: 1 };

export const buttonVariants = {
  hidden: (page: Page) =>
    page === "search/results" ? { y: 120, scale: 0.98, opacity: 1 } : visible,
  visible,
};
