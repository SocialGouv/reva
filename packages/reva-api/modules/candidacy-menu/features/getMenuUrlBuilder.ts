export const menuUrlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ suffix }: { suffix: string }) => {
    const baseUrl =
      process.env.ADMIN_REACT_BASE_URL || "https://vae.gouv.fr/admin2";

    return `${baseUrl}/candidacies/${candidacyId}/${suffix}`;
  };
