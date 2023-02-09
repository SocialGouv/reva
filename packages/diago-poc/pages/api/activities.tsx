import { Competency } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "../../services/diago";
import { Activity } from "../../types/types";
import {prismaClient} from "./prisma"

export const getActivitiesByJobCode = async (professionId: string) =>{
  const activities = await prismaClient.$queryRaw`
    select 
      act.code_ogr, act.label, LEFT(r.code, 1) as secteur
    from activity act
    inner join activity_rome cr on cr.activity_code_ogr = act.code_ogr
    inner join rome r on r.code = cr.rome_code
    inner join profession p on p.rome_id = r.id
    where p.id = ${Number.parseInt(professionId, 10)}
    order by act.label asc
  `
  return activities as Activity[] ;
}

interface CompentencyDiago {
  codeOGR: string;
  title: string;
}
export const getCompetenciesFromDiago = async (professionId: string) => {
  const codesRomeObject = await prismaClient.$queryRaw`
    select distinct
      r.code
    from  rome r 
    inner join profession p on p.rome_id = r.id
    where p.id = ${Number.parseInt(professionId, 10)}
  ` as {code: string}[]


  // call diago api
  const accessToken = await getAccessToken()
  const codeRome = codesRomeObject.map(c => c.code)[0]

  const query = `
  query competences($codeRome: CodeFicheROME!) {
    sousDomaine(codeROME: $codeRome) {
      competencesProches {
        codeOGR
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
      variables: { codeRome: codeRome },
    })
  })
  const competences = (await result.json()).data.sousDomaine.competencesProches as CompentencyDiago[];

  const activities = competences
    .sort((a,b) => a.title > b.title ? 1 : (b.title > a.title ? -1 : 0) )
    .map((c: any) => ({code_ogr: c.codeOGR, label: c.title, secteur: codeRome.charAt(0)} as Activity))
    .reduce((m, c) => {
      if (m.find(comp => comp.code_ogr === c.code_ogr)) {
        return m
      }
      return [...m, c]
    }, [] as Activity[]);

    return {
      debug: {
        query,
        variables: { codeRome: codeRome[0] },
      },
      activities
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Activity[] | {debug: {query: string, variables: unknown}, activities: Activity[]}>
) {
  const { professionId } = req.query;

  if (req.headers['x-target'] === 'diago') {
    res.status(200).json(await getCompetenciesFromDiago(professionId as string))
  } else {
    res.status(200).json(await getActivitiesByJobCode(professionId as string));
  }
}
