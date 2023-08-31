import { Candidacy, Gender } from "@prisma/client";

import { prismaClient } from "../../../../infra/database/postgres/client";
import { generateFundingRequestUnifvaeBatchCsvStream } from "./fundingRequestUnifvae";

const candidateEmail1 = "toto@bongo.eu",
  candidateEmail2 = "titi@bongo.eu",
  candidateEmail3 = "tata@bongo.eu";
const fundingRequestSample = {
  candidateSecondname: "Lapin",
  candidateThirdname: "Piou",
  basicSkillsCost: 12.3,
  basicSkillsHourCount: 2.5,
  certificateSkillsCost: 21.3,
  certificateSkillsHourCount: 2,
  collectiveCost: 21.3,
  collectiveHourCount: 2,
  individualCost: 21.3,
  individualHourCount: 2,
  mandatoryTrainingsCost: 21.3,
  mandatoryTrainingsHourCount: 2,
  otherTrainingCost: 21.3,
  otherTrainingHourCount: 2.5,
  candidateGender: "man" as Gender,
  otherTraining: "",
  certificateSkills: "",
};
let myCandidacy1: Candidacy, myCandidacy2: Candidacy, myCandidacy3: Candidacy;

beforeAll(async () => {
  myCandidacy1 = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail1,
      email: candidateEmail1,
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...fundingRequestSample,
          fundingRequestBatchUnifvae: {
            create: {
              sent: false,
              content: {
                field1: 123,
                field2: "abc, efg, l'alphabet",
                field3: null,
                field4: 0.5,
              },
            },
          },
        },
      },
    },
  });
  myCandidacy2 = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail2,
      email: candidateEmail2,
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...fundingRequestSample,
          fundingRequestBatchUnifvae: {
            create: {
              sent: true,
              content: {
                field1: 123,
                field2: "abc",
                field3: null,
                field4: 0.5,
              },
            },
          },
        },
      },
    },
  });
  myCandidacy3 = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail3,
      email: candidateEmail3,
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...fundingRequestSample,
          fundingRequestBatchUnifvae: {
            create: {
              sent: false,
              content: {
                field1: 234,
                field2: 'formation "géniale", manger debout',
                field3: 3,
                field4: null,
              },
            },
          },
        },
      },
    },
  });
});

afterAll(async () => {
  await prismaClient.fundingRequestBatchUnifvae.deleteMany({});
  await prismaClient.fundingRequestUnifvae.deleteMany({});
  await prismaClient.candidacy.deleteMany({});
});

test("Should generate a CSV stream with fundingRequest to be sent", async () => {
  const itemsToSend = await prismaClient.fundingRequestBatchUnifvae.findMany({
    where: { sent: false },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  expect(itemsToSend.length).toBe(2);
  const batchReadableStream = await generateFundingRequestUnifvaeBatchCsvStream(
    itemsToSend.map((item) => item.id)
  );
  let output = "";
  for await (const chunk of batchReadableStream) {
    output += (chunk as Buffer).toString();
  }
  console.log(output);
  expect(output).toBe(`field1;field2;field3;field4
123;abc, efg, l'alphabet;;0.5
234;"formation ""géniale"", manger debout";3;`);
});
