import fp from 'fastify-plugin';
import Keycloak from 'keycloak-connect';

async function keycloakPlugin(app: any, opts: any, next: any) {

  const {
    config,
    middleware = {
      admin: '/',
      logout: '/logout'
    },
    ...prototypes
  } = opts;

  if (!prototypes.accessDenied) {
    prototypes.accessDenied = (request: any) => {
      request.log.error(`Access to ${request.url} denied.`);
      const err = new Error('Access Denied');
      // eslint-disable-next-line
      // @ts-ignore
      err.status = 403;
      throw err;
    };
  }

  Keycloak.prototype['accessDenied'] = prototypes['accessDenied'];
  
  const keycloak = new Keycloak(
    {},
    // eslint-disable-next-line
    //@ts-ignore
    config
  );

  app.decorate('keycloak', keycloak);
  const middlewares = keycloak.middleware(middleware);

  for (let x = 0; x < middlewares.length; x++) {
    app.addHook('onRequest', middlewares[x]);
  }

  next();
}

export default fp(keycloakPlugin)