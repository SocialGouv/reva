import { Experiences } from "../interface";

export function sortExperiences(experiences: Experiences) {
  const allExperiences = experiences.edited
    ? [...experiences.rest, experiences.edited]
    : experiences.rest;

  return allExperiences.sort(
    (e1, e2) => e2.startDate.getTime() - e1.startDate.getTime()
  );
}
