const DEFAULT_BATCH_SIZE = 200;

interface ProcessInBatchesOptions<T> {
  items: Set<T> | T[];
  handler: (batch: T[]) => Promise<void>;
  batchSize?: number;
}

export async function processInBatches<T>({
  items,
  handler,
  batchSize = DEFAULT_BATCH_SIZE,
}: ProcessInBatchesOptions<T>): Promise<void> {
  const itemsArray = Array.isArray(items) ? items : Array.from(items);
  for (let i = 0; i < itemsArray.length; i += batchSize) {
    const batch = itemsArray.slice(i, i + batchSize);
    await handler(batch);
  }
}
