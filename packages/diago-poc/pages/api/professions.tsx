import { NextApiRequest, NextApiResponse } from "next";
import { Profession } from "../../types/types";
import {prismaClient} from "./prisma"

const jobs = async () => {
  const professions = await prismaClient.profession.findMany({
    orderBy: {
      label: 'asc'
    },
    include: {
      rome: {
        select: {
          code: true
        }
      }
    }
  })
  return professions.map(p => ({
    id: p.id,
    label: p.label,
    codeRome: p.rome?.code || ""
  }))
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Profession[]>
) {
  res.status(200).json(await jobs());
}
