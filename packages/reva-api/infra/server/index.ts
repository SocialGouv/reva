 import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

import { buildApp } from "./app";

const start = async () => {
  const server = await buildApp({ logger: true });
  try {
    await server.listen({
      port: (process.env.PORT || 8080) as number,
      host: "0.0.0.0",
    });
    server.log.info(
      `Server listening on ${process.env.PORT} in ${process.env.NODE_ENV}`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
