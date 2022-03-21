import type { Certification } from "../../../domains/search";
import {prismaClient} from './client'

export const searchCertificationsByQuery = async ({
  query,
}: {
  query: string;
}): Promise<Certification[]> => {

  console.log(query);

  const certifications = (await prismaClient.$queryRaw`
    SELECT certification_search.id AS id,
        ts_rank(
          certification_search.document, plainto_tsquery(unaccent(${query}))
        ) AS rank,
        certification.label,
        certification.summary,
        certification.acronym,
        certification.level,
        certification.activities,
        certification.activity_area as "activityArea",
        certification.accessible_job_type as "accessibleJobType",
        certification.abilities,
        certification.rncp_id as "codeRncp"
        FROM certification_search
        INNER JOIN certification ON certification.id = certification_search.id
        WHERE certification.is_active = true
        ORDER BY rank DESC
        LIMIT 15;
  `) as Certification[];

  return certifications.map((certification) => {
    return {
      id: certification.id,
      label: certification.label,
      summary: certification.summary,
      acronym: certification.acronym,
      level: certification.level,
      activities: certification.activities,
      activityArea: certification.activityArea,
      accessibleJobType: certification.accessibleJobType,
      abilities: certification.abilities,
      codeRncp: certification.codeRncp,
    };
  });
};
