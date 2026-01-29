import { prismaClient } from "@/prisma/client";

export const isOrganismAttachedToCertifications = async ({
  organismId,
  certificationIds,
}: {
  organismId: string;
  certificationIds: string[];
}) => {
  // count all entries in active_organism_by_available_certification_based_on_formacode
  // matching a given organism and a certification id in the list of certification ids
  // since each (organism_id, certification_id) is unique, the count is the number of matching entries

  const result = await prismaClient.$queryRaw<{ count: number }[]>`
    select count(organism_id) from active_organism_by_available_certification_based_on_formacode ao
    where ao.organism_id = uuid(${organismId})
    and ao.certification_id = ANY(STRING_TO_ARRAY(${certificationIds.join(",")}::text, ',')::uuid[])
    `;

  const count = Number(result[0].count);

  return count === certificationIds.length;
};
