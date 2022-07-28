import { Profession } from "../../../domain/types/search";
import { prismaClient } from "./client";

export const searchProfessionsByQuery = async ({ query }: { query: string; }): Promise<Profession[]> => {
  
  const professions = await prismaClient.$queryRaw`
        SELECT profession_search.id AS id,
        ts_rank(
          profession_search.document, plainto_tsquery(unaccent(${query}))
        ) AS rank,
        profession.label,
        profession.description,
        rome.code as codeRome
        FROM profession_search
        INNER JOIN profession ON profession.id = profession_search.id
        INNER JOIN rome ON rome.id = profession.rome_id
        WHERE profession_search.document @@ plainto_tsquery(unaccent(${query}))
        OR profession_search.slug % ${query}
        ORDER BY rank DESC
        LIMIT 5;
  ` as Profession[];


  return professions.map(profession => {
    return {
      id: profession.id,
      label: profession.label,
      description: profession.description,
      codeRome: profession.codeRome
    };
  });
};
