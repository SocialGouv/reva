import dotenv from 'dotenv';
dotenv.config();

export default {
  projects: {
    api: {
      schema: ['./packages/reva-api/modules/generated-graphql-schema.graphql', `${process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL}/graphql`],
      documents: ['./packages/reva-{api,candidate,admin-react}/src/**/*.{graphql,js,ts,jsx,tsx}'],
      extensions: {
        endpoints: {
          default: {
            url: `${process.env.BASE_URL}/api/graphql`,
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN}`,
            },
          },
        },
      },
    },
    website: {
      schema: [`${process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL}/graphql`, './packages/reva-api/modules/generated-graphql-schema.graphql'],
      documents: ['./packages/reva-website/src/**/*.{graphql,js,ts,jsx,tsx}'],
      extensions: {
        endpoints: {
          local: {
            url: 'http://127.0.0.1:1337/graphql',
          },
          prod: {
            url: 'https://strapi.vae.gouv.fr/graphql',
          }
        },
      },
    },
  },
};
