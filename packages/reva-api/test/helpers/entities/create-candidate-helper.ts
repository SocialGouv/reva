import { faker } from "@faker-js/faker";
import { Candidate, Gender } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCandidateHelper = async (
  candidateArgs?: Partial<Candidate>,
): Promise<Candidate> => {
  const parisDepartment = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  return prismaClient.candidate.create({
    data: {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      gender: Gender.man,
      keycloakId: faker.string.uuid(),
      firstname2: faker.person.middleName(),
      firstname3: faker.person.middleName(),
      phone: faker.phone.number(),
      birthdate: faker.date.past(),
      birthCity: faker.location.city(),
      nationality: faker.lorem.word(),
      highestDegreeLabel: faker.lorem.word(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      zip: faker.string.numeric(5),
      addressComplement: faker.lorem.word(),
      givenName: faker.person.fullName(),
      departmentId: parisDepartment?.id ?? "",
      ...candidateArgs,
    },
  });
};
