import * as fs from "fs";
import * as path from "path";

import { parse } from "@fast-csv/parse";

interface ReadCsvRowsParams<T> {
  filePath: string;
  headersDefinition: Array<keyof T | undefined>;
}

interface UpsertCsvRowsParams<T, U> extends ReadCsvRowsParams<T> {
  transform: (row: T) => U;
  upsertCommand: (args: U) => Promise<unknown>;
}

export function upsertCsvRows<T, U>({
  filePath,
  headersDefinition,
  transform,
  upsertCommand,
}: UpsertCsvRowsParams<T, U>): Promise<void> {
  const upsertArgs: U[] = [];
  return new Promise((resolve, error) => {
    fs.createReadStream(path.resolve(__dirname, filePath)).pipe(
      parse({
        headers: headersDefinition as Array<string | undefined>,
        renameHeaders: true,
        ignoreEmpty: true,
      })
        .on("error", (err) => {
          error(err);
        })
        .on("data", (row: T) => upsertArgs.push(transform(row)))
        .on("end", async () => {
          for (const args of upsertArgs) {
            await upsertCommand(args);
          }
          resolve();
        })
    );
  });
}

export function readCsvRows<T>({
  filePath,
  headersDefinition,
}: ReadCsvRowsParams<T>): Promise<T[]> {
  return new Promise((resolve, error) => {
    const rows: T[] = [];
    fs.createReadStream(path.resolve(__dirname, filePath)).pipe(
      parse({
        headers: headersDefinition as Array<string | undefined>,
        renameHeaders: true,
      })
        .on("error", (err) => {
          error(err);
        })
        .on("data", (row) => {
          rows.push(row as T);
        })
        .on("end", () => {
          resolve(rows);
        })
    );
  });
}
