import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Certification, CertificationWithNbCompetencies, CertificationWithPurcentMatch, Competency, Profession } from "../../types/types";
import {prismaClient} from "./prisma"

export const getCertificationsByCompetenciesIds = async (competenciesIds: string[]) =>{
  const certifications = await prismaClient.$queryRaw`
    select cer.*, sum(1)::int as "nb_competencies"
    from certification cer
    inner join competency comp on comp.certification_rncp_id = cer.rncp_id
    where comp.id in (${Prisma.join(competenciesIds.map(c => Number.parseInt(c, 10)))})
    group by 1
    order by "nb_competencies" desc;
  `
  return certifications as CertificationWithNbCompetencies[] ;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CertificationWithPurcentMatch[]>
) {
  const { competenciesIds } = req.query;
  const certifications = await getCertificationsByCompetenciesIds(competenciesIds as string[])
  res.status(200).json(certifications.map(c => {
    const {nb_competencies, ...certification} = c
    return {
      ...certification,
      purcent: nb_competencies / (competenciesIds?.length || 1)
    }
  }));
}
