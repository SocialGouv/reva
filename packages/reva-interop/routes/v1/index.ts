import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";

async function routesApiV1(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: `France VAE Interoperability API (${process.env.NODE_ENV})`,
        description:
          "France VAE's interoperability API to interface with other official entities",
        version: "1.0.0",
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://localhost:3005/",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  fastify.addHook("onRequest", (request, _reply, done) => {
    if (request.url === "/v1/docs" || request.url === "/v1/schema.json") {
      return done();
    }
    console.log("Validate Bearer token here");
    done();
  });

  // Declare a route
  fastify.get("/", {
    schema: {
      // request needs to have a querystring with a `name` parameter
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
      // the response needs to be an object with an `hello` property of type 'string'
      response: {
        200: {
          type: "object",
          properties: {
            hello: { type: "string" },
          },
        },
      },
    },
    handler: async (_request, _reply) => {
      return { hello: "world" };
    },
  });

  fastify.get("/schema.json", { schema: { hide: true } }, async () => {
    return fastify.swagger();
  });

  fastify.get("/docs", { schema: { hide: true } }, async (_request, reply) => {
    reply.type("html");
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Redoc</title>
    <!-- needed for adaptive design -->
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <!--
    Redoc doesn't change outer page styles
    -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='${process.env.BASE_URL || "http://localhost:3005"}/v1/schema.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>`;
  });
}

export default routesApiV1;
