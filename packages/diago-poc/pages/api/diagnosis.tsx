import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { CertificationWithPurcentMatch } from "../../types/types";
import {prismaClient} from "./prisma"

export const getCertificationsByactivitiesCodeOgrs = async (activitiesCodeOgrs: string[] = []) =>{
  const certifications = await prismaClient.$queryRaw`

    select c.*,
      cer_comp.sum_activities::int as nb_activities_match,
      cer_comp_all.sum_activities::int as nb_activities_total,
      (cer_comp.sum_activities/cer_comp_all.sum_activities::float)*100 as purcent
    from certification c
    
    inner join (select cer.id, sum(1) as "sum_activities"
        from certification cer
        inner join rome_certification rc on rc.certification_id = cer.id
        inner join rome r on r.id = rc.rome_id
        inner join activity_rome ar on ar.rome_code = r.code
        where ar.activity_code_ogr in (${Prisma.join(activitiesCodeOgrs)})
      group by 1) cer_comp on cer_comp.id = c.id
    
    inner join (select cer.id, sum(1) as "sum_activities"
        from certification cer
        inner join rome_certification rc on rc.certification_id = cer.id
        inner join rome r on r.id = rc.rome_id
        inner join activity_rome ar on ar.rome_code = r.code
      group by 1) cer_comp_all on cer_comp_all.id = c.id
      order by purcent desc;
  `
  return certifications as CertificationWithPurcentMatch[] ;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CertificationWithPurcentMatch[] | any>
) {
  if (req.method === 'POST') {
    const payload = JSON.parse(req.body);
    const diagnosis = await prismaClient.diagnosis.create({
      data: {
        revaIdentifier: payload.revaIdentifier,
        content: payload
      }
    })
    res.status(200).json(diagnosis)
  } else {
    const { activitiesCodeOgrs } = req.query;
    const ids = typeof activitiesCodeOgrs === 'string' ? [activitiesCodeOgrs] : (activitiesCodeOgrs);
    const certifications = await getCertificationsByactivitiesCodeOgrs(ids)
    res.status(200).json(certifications);
  }
}
