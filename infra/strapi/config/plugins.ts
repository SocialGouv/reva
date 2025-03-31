module.exports = ({ env }) => ({
  graphql: {
    config: {
      apolloServer: {
        introspection: true,
      },
    },
  },
  "preview-button": {
    config: {
      contentTypes: [
        {
          uid: "api::article-d-aide.article-d-aide",
          draft: {
            alwaysVisible: true,
            url: `${env("WEBSITE_URL")}/websiteapi/preview`,
            query: {
              type: "article-d-aide",
              slug: "{slug}",
              secret: env("STRAPI_PREVIEW_SECRET"),
            },
          },
          published: {
            url: `${env("WEBSITE_URL")}/savoir-plus/articles/{slug}`,
          },
        },
        {
          uid: "api::article-faq.article-faq",
          draft: {
            alwaysVisible: true,
            url: `${env("WEBSITE_URL")}/websiteapi/preview`,
            query: {
              type: "article-faq",
              secret: env("STRAPI_PREVIEW_SECRET"),
            },
          },
          published: {
            url: `${env("WEBSITE_URL")}/faq`,
          },
        },
        {
          uid: "api::region.region",
          draft: {
            alwaysVisible: true,
            url: `${env("WEBSITE_URL")}/websiteapi/app/preview`,
            query: {
              type: "region",
              slug: "{slug}",
              secret: env("STRAPI_PREVIEW_SECRET"),
            },
          },
          published: {
            url: `${env("WEBSITE_URL")}/regions/{slug}`,
          },
        },
        {
          uid: "api::article-region.article-region",
          draft: {
            alwaysVisible: true,
            url: `${env("WEBSITE_URL")}/websiteapi/app/preview`,
            query: {
              type: "article-region",
              slug: "{slug}",
              id: "{documentId}",
              secret: env("STRAPI_PREVIEW_SECRET"),
            },
          },
          published: {
            url: `${env("WEBSITE_URL")}/regions`,
          },
        },
        {
          uid: "api::legal.legal",
          draft: {
            alwaysVisible: true,
            url: `${env("WEBSITE_URL")}/websiteapi/preview`,
            query: {
              type: "legal",
              slug: "{nom}",
              secret: env("STRAPI_PREVIEW_SECRET"),
            },
          },
          published: {
            url: `${env("WEBSITE_URL")}/legal/{nom}`,
          },
        },
      ],
    },
  },
});
