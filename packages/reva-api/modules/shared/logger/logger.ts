import pino from "pino";

const datadogApiKey = process.env.DATADOG_API_KEY;
const pinoTransport = datadogApiKey
  ? pino.transport({
      targets: [
        {
          target: "pino-datadog-transport",
          level: "info",
          options: {
            ddClientConf: {
              authMethods: {
                apiKeyAuth: datadogApiKey,
              },
            },
            ddServerConf: { site: "datadoghq.eu" },
          },
        },
        { target: "pino/file", level: "info", options: {} },
      ],
    })
  : undefined;

export const logger = pino({ level: "info" }, pinoTransport);
