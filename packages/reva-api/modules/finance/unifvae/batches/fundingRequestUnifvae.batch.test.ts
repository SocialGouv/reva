import { prismaClient } from "../../../../prisma/client";
import { createFundingRequestBatchHelper } from "../../../../test/helpers/entities/create-funding-request-batch-helper";
import { generateFundingRequestUnifvaeBatchCsvStream } from "./fundingRequestUnifvae";

test("Should generate a CSV stream with fundingRequest to be sent", async () => {
  await createFundingRequestBatchHelper({
    content: {
      field1: 123,
      field2: "abc, efg, l'alphabet",
      field3: null,
      field4: 0.5,
    },
  });
  await createFundingRequestBatchHelper({
    sent: true,
    content: {
      field1: 123,
      field2: "abc",
      field3: null,
      field4: 0.5,
    },
  });
  await createFundingRequestBatchHelper({
    content: {
      field1: 234,
      field2: 'formation "géniale", manger debout',
      field3: 3,
      field4: null,
    },
  });

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
  expect(output).toBe(`field1;field2;field3;field4
123;abc, efg, l'alphabet;;0.5
234;"formation ""géniale"", manger debout";3;`);
});
