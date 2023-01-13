import { NextApiRequest, NextApiResponse } from "next";
import { Job } from "../../types/types";
import competenciesFile from "../../data/competencies.json";

export const getCompetencyByJobCode = (jobCode: string) =>
  competenciesFile
    .filter((cf) => cf.Numero_Fiche === jobCode)
    .map((cf) => ({
      code: cf.Bloc_Competences_Code,
      label: cf.Bloc_Competences_Libelle,
    }));

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Job[]>
) {
  const { jobCode } = req.query;
  res.status(200).json(getCompetencyByJobCode(jobCode as string));
}
