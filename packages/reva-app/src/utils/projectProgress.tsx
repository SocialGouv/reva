import { Certification, Contact, Experiences, Goal } from "../interface";
import { sortExperiences } from "./experienceHelpers";

interface projectProgressProps {
  certification?: Certification;
  contact?: Contact;
  experiences: Experiences;
  goals: Goal[];
}

export function projectProgress({
  certification,
  contact,
  experiences,
  goals,
}: projectProgressProps) {
  const hasCertification: boolean = certification !== undefined;
  const hasContact: boolean =
    contact !== undefined && (contact?.email !== "" || contact?.phone !== "");
  const hasExperiences: boolean = sortExperiences(experiences).length > 0;
  const hasGoals: boolean = goals.filter((goal) => goal.checked).length > 0;

  const validations: boolean[] = [
    hasCertification,
    hasContact,
    hasExperiences,
    hasGoals,
  ];

  const validated: number = validations.filter((e) => e === true).length;
  return 100;
  //return (100 * validated) / 4;
}
