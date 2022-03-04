import type { Certification } from "../../../domains/search";
import { PrismaClient } from '@prisma/client'

export const searchCertificationsByQuery = async ({ query }: { query: string; }): Promise<Certification[]> => {

  const client = new PrismaClient();

  console.log(query)

  const certifications = await client.$queryRaw`
    SELECT certification_search.id AS id,
        ts_rank(
          certification_search.document, plainto_tsquery(unaccent(${query}))
        ) AS rank,
        certification.title,
        certification.description
        FROM certification_search
        INNER JOIN certification ON certification.id = certification_search.id
        WHERE certification_search.document @@ plainto_tsquery(unaccent(${query}))
        OR certification_search.slug % ${query}
        ORDER BY rank DESC
        LIMIT 5;
  ` as Certification[]


  return certifications.map(certification => {
    return {
      id: certification.id,
      title : certification.title,
      description: certification.description
    }
  });
};
