export const menuUrlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ suffix }: { suffix: string }) => {
    const baseUrl =
      process.env.ADMIN_REACT_BASE_URL ||
      process.env.BASE_URL ||
      "https://vae.gouv.fr";

    return `${baseUrl}/admin2/candidacies/${candidacyId}/${suffix}`;
  };
