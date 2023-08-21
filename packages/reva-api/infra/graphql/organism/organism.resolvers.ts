import { getOrganismOnDepartmentsByOrganismIdAndDepartmentId } from "./organism.features";

export const organismResolvers = {
  Organism: {
    organismOnDepartments: (
      { id: organismId }: { id: string },
      { departmentId }: { departmentId: string }
    ) =>
      getOrganismOnDepartmentsByOrganismIdAndDepartmentId({
        organismId,
        departmentId,
      }),
  },
};
