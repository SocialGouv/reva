import * as fs from "fs";
import * as path from "path";

import { parse } from "@fast-csv/parse";

interface ReadCsvRowsParams<T> {
  filePath: string;
  headersDefinition: Array<keyof T | undefined>;
}

interface InjectCsvRowsParams<T, U> extends ReadCsvRowsParams<T> {
  transform: (row: T) => U;
  injectCommand: (args: U) => Promise<unknown>;
}

export function injectCsvRows<T, U>({
  filePath,
  headersDefinition,
  transform,
  injectCommand,
}: InjectCsvRowsParams<T, U>): Promise<void> {
  const injectArgs: U[] = [];
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
        .on("data", (row: T) => {
          const t = transform(row);
          console.log(
            `---- ${(t as any).create.id} -- ${(t as any).create.label}`
          );
          injectArgs.push(t);
        })
        .on("end", async () => {
          for (const args of injectArgs) {
            await injectCommand(args);
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
