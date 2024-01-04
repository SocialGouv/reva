import { getDepartmentsByRegionIds } from "./features/getDepartmentsByRegionIds";

export const referentialLoaders = {
  Region: {
    departments: async (queries: { obj: { id: string } }[]) => {
      const regionIds: string[] = queries.map(({ obj }) => obj.id);
      const departments = await getDepartmentsByRegionIds({ regionIds });
      return regionIds.map((rid) =>
        departments.filter((d) => d.regionId === rid)
      );
    },
  },
};
