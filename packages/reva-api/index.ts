import fastify from 'fastify';
import mercurius from 'mercurius';
import path from 'path';
import proxy from 'fastify-http-proxy';
import fastifyStatic from 'fastify-static';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '..', '..', '.env') });

const server = fastify({ logger: true });
const WEBSITE_ROUTE_PATH = '/';
const APP_ROUTE_PATH = '/app';

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers = {
  Query: {
    add: async (_: any, { x, y }: { x: number, y: number; }) => x + y
  }
};

if (process.env.NODE_ENV === 'production') {
  server.register(fastifyStatic, {
    root: path.join(__dirname, 'website'),
    prefix: WEBSITE_ROUTE_PATH
  });

  server.register(fastifyStatic, {
    root: path.join(__dirname, 'app'),
    prefix: APP_ROUTE_PATH,
    decorateReply: false
  }); 

  // Deal with not found
  server.setNotFoundHandler((req, res) => {
    if (req.url.startsWith(APP_ROUTE_PATH)) {
      res.sendFile('index.html', path.join(__dirname, 'app'));
    } else {
      res.sendFile('index.html', path.join(__dirname, 'website'));
    }
  });

} else {
  server.register(proxy, {
    upstream: 'http://localhost:1234',
    prefix: WEBSITE_ROUTE_PATH
  });

  server.register(proxy, {
    upstream: 'http://localhost:1235/app',
    prefix: APP_ROUTE_PATH
  });
}

server.register(mercurius, {
  schema,
  resolvers,
  graphiql: !!process.env.GRAPHIQL
});


server.get('/ping', async (request, reply) => {
  return 'pong';
});

server.listen(process.env.PORT || 8080, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address} in ${process.env.NODE_ENV}`);
});
