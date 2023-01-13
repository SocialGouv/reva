import { NextApiRequest, NextApiResponse } from "next";
import { Job } from "../../types/types";
import romeFiles from "../../data/rome_files.json";

const jobs = romeFiles.map((r) => ({
  code: r.Numero_Fiche,
  label: r.Codes_Rome_Libelle,
}));

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Job[]>
) {
  res.status(200).json(jobs as Job[]);
}
