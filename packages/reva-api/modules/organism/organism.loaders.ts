import { getOrganismOnDepartmentsByOrganismAndDepartmentIds } from "./features";
import { getInformationsCommercialesByOrganismIds } from "./features/getInformationsCommerciales";

export const organismLoaders = {
  Organism: {
    organismOnDepartments: async (
      queries: {
        obj: { organismId: string };
        params: { departmentId?: string };
      }[]
    ) => {
      const organismAndDepartmentIds: {
        organismId: string;
        departmentId?: string;
      }[] = queries.map(
        ({ obj: { organismId }, params: { departmentId } }) => ({
          organismId,
          departmentId,
        })
      );
      const organismOnDepartments =
        await getOrganismOnDepartmentsByOrganismAndDepartmentIds({
          organismAndDepartmentIds,
        });

      const mapped = organismAndDepartmentIds.map((odids) =>
        organismOnDepartments.filter(
          (ood) =>
            ood.organismId === odids.organismId &&
            (odids.departmentId === ood.departmentId || !odids.departmentId)
        )
      );

      return mapped;
    },
    informationsCommerciales: async (
      queries: {
        obj: { id: string };
      }[]
    ) => {
      const organismIds = queries.map((q) => q.obj.id);

      const informationsCommerciales =
        await getInformationsCommercialesByOrganismIds({ organismIds });

      return organismIds.map((oid) =>
        informationsCommerciales.find((ic) => ic.organismId === oid)
      );
    },
  },
};
