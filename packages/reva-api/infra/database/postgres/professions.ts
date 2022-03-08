import { PrismaClient } from "@prisma/client";
import { Profession } from "../../../domains/search";

export const searchProfessionsByQuery = async ({ query }: { query: string; }): Promise<Profession[]> => {
  
  const client = new PrismaClient();

  const professions = await client.$queryRaw`
        SELECT profession_search.id AS id,
        ts_rank(
          profession_search.document, plainto_tsquery(unaccent(${query}))
        ) AS rank,
        profession.title,
        profession.description,
        rome.code as codeRome
        FROM profession_search
        INNER JOIN profession ON profession.id = profession_search.id
        INNER JOIN rome ON rome.id = profession.rome_id
        WHERE profession_search.document @@ plainto_tsquery(unaccent(${query}))
        OR profession_search.slug % ${query}
        ORDER BY rank DESC
        LIMIT 5;
  ` as Profession[]


  return professions.map(profession => {
    return {
      id: profession.id,
      title : profession.title,
      description: profession.description,
      codeRome: profession.codeRome
    }
  });
};
