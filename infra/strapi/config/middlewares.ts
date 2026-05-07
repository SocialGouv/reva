export default [
  "strapi::logger",
  "strapi::errors",
  // 'strapi::security',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "https://cdn.ckeditor.com",
            "https://grateful-event-39c5178d33.strapiapp.com",
            "https://healing-nature-bb0384846f.media.strapiapp.com",
            "https://strapi.vae.gouv.fr",
          ],
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
