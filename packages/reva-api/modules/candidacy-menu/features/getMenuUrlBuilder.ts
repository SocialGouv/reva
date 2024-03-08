export const menuUrlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ adminType, suffix }: { adminType: "Elm" | "React"; suffix: string }) =>
    `${process.env.BASE_URL || "https://vae.gouv.fr"}/${adminType === "Elm" ? "admin" : "admin2"}/candidacies/${candidacyId}/${suffix}`;
