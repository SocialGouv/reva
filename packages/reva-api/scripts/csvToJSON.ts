import * as fs from "fs";
import * as path from "path";

import { parse } from "@fast-csv/parse";

interface CsvToJsonOptions {
  inputFile: string;
  outputFile?: string;
  delimiter?: string;
  headers?: boolean;
}

async function csvToJson({
  inputFile,
  outputFile,
  delimiter = ",",
  headers = true,
}: CsvToJsonOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    const inputPath = path.resolve(inputFile);

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      reject(new Error(`Input file not found: ${inputPath}`));
      return;
    }

    fs.createReadStream(inputPath)
      .pipe(
        parse({
          headers,
          delimiter,
          ignoreEmpty: true,
        }),
      )
      .on("error", (error) => {
        reject(error);
      })
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        try {
          const json = JSON.stringify(rows, null, 2);

          if (outputFile) {
            const outputPath = path.resolve(outputFile);
            fs.writeFileSync(outputPath, json, "utf-8");
            console.log(`✅ Converted ${rows.length} rows from CSV to JSON`);
            console.log(`📄 Output written to: ${outputPath}`);
          } else {
            console.log(JSON.stringify(rows, null, 2));
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: tsx csv-to-json.ts <input.csv> [output.json] [options]",
    );
    console.error("\nOptions:");
    console.error("  --delimiter=<char>  CSV delimiter (default: ',')");
    console.error("  --no-headers        Treat first row as data, not headers");
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1]?.startsWith("--") ? undefined : args[1];

  const options: CsvToJsonOptions = {
    inputFile,
    outputFile,
  };

  // Parse options
  args.forEach((arg) => {
    if (arg.startsWith("--delimiter=")) {
      options.delimiter = arg.split("=")[1];
    } else if (arg === "--no-headers") {
      options.headers = false;
    }
  });

  try {
    await csvToJson(options);
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// export { csvToJson };
