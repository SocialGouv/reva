import { NextApiRequest, NextApiResponse } from "next";
import { Competency } from "../../types/types";
import {prismaClient} from "./prisma"

export const getCompetencyByJobCode = async (professionId: string) =>{
  const competencies = await prismaClient.$queryRaw`
    select 
      comp.*
    from competency comp
    inner join competency_rome cr on cr.competence_code_ogr = comp.code_ogr
    inner join rome r on r.code = cr.rome_code
    inner join profession p on p.rome_id = r.id
    where p.id = ${Number.parseInt(professionId, 10)}
    order by comp.label asc
  `
  return competencies as Competency[] ;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Competency[]>
) {
  const { professionId } = req.query;
  res.status(200).json(await getCompetencyByJobCode(professionId as string));
}
