// import { Prisma } from "@prisma/client";

// import { processPaginationInfo } from "@/modules/shared/list/pagination";
// import { prismaClient } from "@/prisma/client";

// export const getPaginatedCertificationByCertificationAuthorityLocalAccountId =
//   async ({
//     certificationAuthorityLocalAccountId,
//     searchText,
//     limit = 10,
//     offset = 0,
//   }: {
//     certificationAuthorityLocalAccountId: string;
//     searchText?: string;
//     limit?: number;
//     offset?: number;
//   }) => {
//     const realLimit = limit ?? 10;
//     const realOffset = offset ?? 0;

//     const whereClause: Prisma.CertificationWhereInput = {
//       certificationAuthorityLocalAccountOnCertification: {
//         some: {
//           certificationAuthorityLocalAccountId,
//         },
//       },
//     };

//     if (searchText) {
//       whereClause.OR = [
//         { label: { contains: searchText, mode: "insensitive" } },
//         { rncpId: { contains: searchText, mode: "insensitive" } },
//         {
//           certificationAuthorityStructure: {
//             label: { contains: searchText, mode: "insensitive" },
//           },
//         },
//         {
//           rncpTypeDiplome: { contains: searchText, mode: "insensitive" },
//         },
//       ];
//     }

//     const certifications = await prismaClient.certification.findMany({
//       where: whereClause,
//       orderBy: [{ label: "asc" }],
//       take: realLimit,
//       skip: realOffset,
//     });

//     const count = await prismaClient.certification.count({
//       where: whereClause,
//     });

//     return {
//       rows: certifications.map((c) => ({ ...c, codeRncp: c.rncpId })),
//       info: processPaginationInfo({
//         totalRows: count,
//         limit: realLimit,
//         offset: realOffset,
//       }),
//     };
//   };
