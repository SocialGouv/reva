import {
  Certification,
  Contact,
  Experiences,
  Goal,
  Organism,
} from "../interface";
import { sortExperiences } from "./experienceHelpers";

interface projectProgressProps {
  certification?: Certification;
  contact?: Contact;
  experiences: Experiences;
  goals: Goal[];
  organism?: Organism;
}

export function projectProgress({
  certification,
  contact,
  experiences,
  goals,
  organism,
}: projectProgressProps) {
  const hasCertification: boolean = certification !== undefined;
  const hasContact: boolean =
    contact !== undefined &&
    (contact?.email !== null || contact?.phone !== null);
  const hasExperiences: boolean = sortExperiences(experiences).length > 0;
  const hasGoals: boolean = goals.filter((goal) => goal.checked).length > 0;
  const hasOrganism: boolean = organism !== undefined;

  const validations: boolean[] = [
    hasCertification,
    hasContact,
    hasExperiences,
    hasGoals,
    hasOrganism,
  ];

  const validated: number = validations.filter((e) => e === true).length;

  return (100 * validated) / validations.length;
}
