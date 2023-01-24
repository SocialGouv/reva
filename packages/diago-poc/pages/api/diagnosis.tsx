import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { CertificationWithPurcentMatch } from "../../types/types";
import {prismaClient} from "./prisma"

export const getCertificationsByCompetenciesIds = async (competenciesIds: string[]) =>{
  const certifications = await prismaClient.$queryRaw`
    select c.*,
      cer_comp.sum_competencies::int as nb_competencies_match,
      cer_comp_all.sum_competencies::int as nb_competencies_total,
      (cer_comp.sum_competencies/cer_comp_all.sum_competencies::float)*100 as purcent
    from certification c
    inner join (select cer.id, sum(1) as "sum_competencies", sum(1) as "sum_all_competencies"
        from certification cer
        inner join competency comp on comp.certification_rncp_id = cer.rncp_id
        where comp.id in (${Prisma.join(competenciesIds.map(c => Number.parseInt(c, 10)))})
      group by 1) cer_comp on cer_comp.id = c.id
    inner join (select cer.id, sum(1) as "sum_competencies"
        from certification cer
        inner join competency comp on comp.certification_rncp_id = cer.rncp_id
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
    const { competenciesIds } = req.query;
    const certifications = await getCertificationsByCompetenciesIds(competenciesIds as string[])
    res.status(200).json(certifications);
  }
}
