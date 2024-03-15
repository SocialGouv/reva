export const menuUrlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ adminType, suffix }: { adminType: "Elm" | "React"; suffix: string }) => {
    const baseUrl =
      (adminType === "Elm"
        ? process.env.ADMIN_ELM_BASE_URL
        : process.env.ADMIN_REACT_BASE_URL) ||
      process.env.BASE_URL ||
      "https://vae.gouv.fr";

    return `${baseUrl}/${adminType === "Elm" ? "admin" : "admin2"}/candidacies/${candidacyId}/${suffix}`;
  };
