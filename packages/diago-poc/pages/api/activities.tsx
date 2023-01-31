import { NextApiRequest, NextApiResponse } from "next";
import { Activity } from "../../types/types";
import {prismaClient} from "./prisma"

export const getActivitiesByJobCode = async (professionId: string) =>{
  const activities = await prismaClient.$queryRaw`
    select 
      act.*
    from activity act
    inner join activity_rome cr on cr.activity_code_ogr = act.code_ogr
    inner join rome r on r.code = cr.rome_code
    inner join profession p on p.rome_id = r.id
    where p.id = ${Number.parseInt(professionId, 10)}
    order by act.label asc
  `
  return activities as Activity[] ;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Activity[]>
) {
  const { professionId } = req.query;
  res.status(200).json(await getActivitiesByJobCode(professionId as string));
}
