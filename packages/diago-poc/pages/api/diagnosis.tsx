import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "../../services/diago";
import { CertificationWithPurcentMatch } from "../../types/types";
import {prismaClient} from "./prisma"

export const getCertificationsByActivitiesCodeOgrs = async (activitiesCodeOgrs: string[] = []) =>{
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

export const getCertificationsByActivitiesCodeOgrsFromDiago = async (codesOgr: string[] = []) =>{
  // call diago api
  const accessToken = await getAccessToken()

  const query = `
  query certifications($codesOgr: [String!]!) {
    certificationsSatellitairesViaCompetences(codesOGR: $codesOgr, limit: 20) {
      score
      certification {
        id
        level
        codeRNCP
        title
      }
    }
  }`;

  const result = await fetch(process.env.DIAGO_URL as string, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { codesOgr },
    })
  })
  const certifications = (await result.json()).data.certificationsSatellitairesViaCompetences;

  return certifications.map(
    (c: any) => {
      return {
          id: c.certification.id,
          rncpId: c.certification.codeRNCP,
          label: c.certification.title,
          purcent: (c.score * 100),
          nb_activities_match: 0,
          nb_activities_total: 0
      }
    }
  ) as CertificationWithPurcentMatch[] ;
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

    if (req.headers['x-target'] === 'diago') {
      res.status(200).json(await getCertificationsByActivitiesCodeOgrsFromDiago(ids))
    } else {
      const certifications = await getCertificationsByActivitiesCodeOgrs(ids)
      res.status(200).json(certifications);
    }

  }
}
