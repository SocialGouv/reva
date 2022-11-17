import { Either, Left, Right } from "purify-ts";
import type { Certification } from "../../../domain/types/search";
import { prismaClient } from './client';

export const searchCertificationsByQuery = async ({
  query,
}: {
  query: string;
}): Promise<Certification[]> => {
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
        certification.rncp_id as "codeRncp",
        certification.status
        FROM certification_search
        INNER JOIN certification ON certification.id = certification_search.id
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
      status: certification.status,
    };
  });
};

export const getCertificationById = async ({ id }: { id: string; }): Promise<Certification | null> => {
  const certification = await prismaClient.certification.findUnique({
    where: {
      id
    }
  });

  if (certification) {

    return {
      ...certification,
      codeRncp: certification.rncpId
    };
  }
  return null;
};

export const getCertifications = async ({departmentId}: {departmentId: string}): Promise<Either<string, Certification[]>> => {
  try {
    const certifications = (await prismaClient.$queryRaw`
    SELECT DISTINCT ON (id) certification_search.id,
        certification.label,
        certification.summary,
        certification.acronym,
        certification.level,
        certification.activities,
        certification.activity_area as "activityArea",
        certification.accessible_job_type as "accessibleJobType",
        certification.abilities,
        certification.rncp_id as "codeRncp",
        certification.status
        FROM certification_search
        INNER JOIN certification ON certification.id = certification_search.id
        INNER JOIN organism_region_certification ON organism_region_certification.certification_id = certification.id
        INNER JOIN organism ON organism.id = organism_region_certification.organism_id
        INNER JOIN region ON region.id = organism_region_certification.region_id
        INNER JOIN department ON department.region_id = region.id
        WHERE department.id = ${departmentId}
        AND organism_region_certification.is_architect = true
        AND organism.is_active = true
        ORDER BY id, label DESC;
  `) as Certification[];

    return Right(certifications.map((certification) => {
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
        status: certification.status,
      };
    }));
  }
  catch (e) {
    return Left(`error while retrieving certificates`);
  }
};

