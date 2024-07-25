import { getInformationsCommercialesByOrganismIds } from "./features/getInformationsCommerciales";

export const organismLoaders = {
  Organism: {
    informationsCommerciales: async (
      queries: {
        obj: { id: string };
      }[],
    ) => {
      const organismIds = queries.map((q) => q.obj.id);

      const informationsCommerciales =
        await getInformationsCommercialesByOrganismIds({ organismIds });

      return organismIds.map((oid) =>
        informationsCommerciales.find((ic) => ic.organismId === oid),
      );
    },
  },
};
