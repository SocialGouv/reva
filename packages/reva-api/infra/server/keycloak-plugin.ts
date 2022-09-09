import fp from 'fastify-plugin';
import Keycloak from 'keycloak-connect';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { userInfo } from 'os';

const hasRole = (roles: string[]) => (role: string) => roles.includes(role)

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

  app.decorate('auth', {
    hasRole: (role: string) => {
      return app.userInfo?.realm_access?.roles.includes(role)
    }
  })

  app.decorate('keycloak', keycloak);
  app.addHook('onRequest', async (req: any, res: any) => {
    app.userInfo = undefined;
    if (!req.headers.authorization) {
      return;
    }

    // eslint-disable-next-line no-unsafe-optional-chaining
    const [, token] = req.headers.authorization.split("Bearer ")
    if (token) {
      try {
        app.userInfo = await keycloak.grantManager.userInfo(token)
      }
      catch(e) {
        console.log(e)
      }
    }
  })

  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_ADMIN_URL,
    realmName: process.env.KEYCLOAK_ADMIN_REALM
  });

  const getKeycloakAdmin = async () => {
    try {
      await kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID || 'admin-cli',
        clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
      });
    } catch (e) {
      console.log(e);  
    } 
      
    return kcAdminClient;
  }
  
  app.decorate('getKeycloakAdmin', getKeycloakAdmin);

  next();
}

export default fp(keycloakPlugin)