import { State } from "./machines/main.machine";

const visible = { y: 0, scale: 1, opacity: 1 };

export const buttonVariants = {
  hidden: (page: State) =>
    [
      "applicationDataLoaded",
      "searchResults",
      "searchResultsError",
      "loadingCertifications",
    ].includes(page)
      ? { y: 120, scale: 0.98, opacity: 1 }
      : visible,
  visible,
};
