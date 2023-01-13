import { NextApiRequest, NextApiResponse } from "next";
import { Certification, Competency, Job } from "../../types/types";

const certifications: Certification[] = [
  { code: "cert1", label: "Certification1" },
  { code: "cert2", label: "Certification2" },
];
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Certification[]>
) {
  const competencies = req.body;
  res.status(200).json(certifications);
}
