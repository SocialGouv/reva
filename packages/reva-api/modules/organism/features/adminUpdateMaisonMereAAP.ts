import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const adminUpdateMaisonMereAAP = async (params: {
  maisonMereAAPId: string;
  maisonMereAAPData: {
    zoneIntervention: {
      departmentId: string;
      isOnSite: boolean;
      isRemote: boolean;
    }[];
  };
}) => {
  const { maisonMereAAPId, maisonMereAAPData } = params;

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
  });

  if (!maisonMereAAP) {
    throw new Error(`Cette maison mère est introuvable`);
  }

  const organisms: Organism[] = await prismaClient.organism.findMany({
    where: { maisonMereAAPId },
  });

  const organismOnDepartments: {
    departmentId: string;
    department: { label: string };
    isOnSite: boolean;
    isRemote: boolean;
  }[] = await prismaClient.organismsOnDepartments.findMany({
    where: { OR: organisms.map((organism) => ({ organismId: organism.id })) },
    include: { department: true },
  });

  const departmentsNotOnZoneIntervention = organismOnDepartments.filter(
    (organismOnDepartment) => {
      const maisonMereOnDepartment = maisonMereAAPData.zoneIntervention.find(
        (department) =>
          department.departmentId === organismOnDepartment.departmentId,
      );

      return (
        !maisonMereOnDepartment ||
        (organismOnDepartment.isOnSite && !maisonMereOnDepartment.isOnSite) ||
        (organismOnDepartment.isRemote && !maisonMereOnDepartment.isRemote)
      );
    },
  );

  const departmentLabels = [
    ...new Set(
      departmentsNotOnZoneIntervention.map(
        (department) => department.department.label,
      ),
    ),
  ];

  const departmentList =
    departmentLabels.length > 1
      ? `${departmentLabels.slice(0, -1).join(", ")} et ${departmentLabels.slice(-1)}`
      : departmentLabels[0] || "";

  if (departmentsNotOnZoneIntervention.length > 0) {
    throw new Error(
      `Une ou plusieurs agences sont positionnées sur ${departmentList}. Vous ne pouvez pas le(s) décocher.`,
    );
  }

  await prismaClient.$transaction([
    prismaClient.maisonMereAAPOnDepartement.deleteMany({
      where: { maisonMereAAPId: maisonMereAAPId },
    }),
    prismaClient.maisonMereAAPOnDepartement.createMany({
      data: maisonMereAAPData.zoneIntervention.map((department) => ({
        departementId: department.departmentId,
        maisonMereAAPId: maisonMereAAP.id,
        estSurPlace: department.isOnSite,
        estADistance: department.isRemote,
      })),
    }),
  ]);

  return "OK";
};
