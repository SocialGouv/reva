import * as fs from "fs";
import * as path from "path";

import { parse } from "@fast-csv/parse";

export function readCsvRows<T>(
  filePath: string,
  headersDefinition: Array<keyof T | undefined>
): Promise<T[]> {
  return new Promise((resolve, error) => {
    const rows: T[] = [];
    fs.createReadStream(
      path.resolve(__dirname, filePath)
    ).pipe(
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
