import path from "path";

import dotenv from "dotenv";

import { buildApp } from "./app";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const start = async () => {
  const server = await buildApp({
    logger: true,
    disableRequestLogging: true,
  });
  try {
    await server.listen({
      port: (process.env.PORT || 8080) as number,
      host: "0.0.0.0",
    });
    server.log.info(
      `Server listening on ${process.env.PORT} in ${process.env.NODE_ENV}`,
    );

    //TODO remove here and implement in the right place
    // await getAAPsWithZipCodeAndDistance({ distance: 15, zip: "93100" });
    // await generateLLToEarthFromZipCodeToAAP();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
