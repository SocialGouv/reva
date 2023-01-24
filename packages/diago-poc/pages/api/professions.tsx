import { NextApiRequest, NextApiResponse } from "next";
import { Profession } from "../../types/types";
import romeFiles from "../../data/rome_files.json";
import {prismaClient} from "./prisma"

// const jobs = romeFiles.map((r) => ({
//   code: r.Numero_Fiche,
//   label: r.Codes_Rome_Libelle,
// }));

const jobs = async () => {
  const professions = await prismaClient.profession.findMany({
    orderBy: {
      label: 'asc'
    }
  })
  return professions
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Profession[]>
) {
  res.status(200).json(await jobs());
}
