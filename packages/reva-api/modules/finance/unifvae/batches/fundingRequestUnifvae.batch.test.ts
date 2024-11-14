import { Gender } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import { generateFundingRequestUnifvaeBatchCsvStream } from "./fundingRequestUnifvae";

const FUNDING_REQUEST_SAMPLE = {
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

beforeAll(async () => {
  await prismaClient.candidacy.create({
    data: {
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...FUNDING_REQUEST_SAMPLE,
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
  await prismaClient.candidacy.create({
    data: {
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...FUNDING_REQUEST_SAMPLE,
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
  await prismaClient.candidacy.create({
    data: {
      financeModule: "unifvae",
      fundingRequestUnifvae: {
        create: {
          ...FUNDING_REQUEST_SAMPLE,
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
    itemsToSend.map((item) => item.id),
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
