import type { Attribute, Schema } from "@strapi/strapi";

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: "strapi_api_tokens";
  info: {
    description: "";
    displayName: "Api Token";
    name: "Api Token";
    pluralName: "api-tokens";
    singularName: "api-token";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::api-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<"">;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      "admin::api-token",
      "oneToMany",
      "admin::api-token-permission"
    >;
    type: Attribute.Enumeration<["read-only", "full-access", "custom"]> &
      Attribute.Required &
      Attribute.DefaultTo<"read-only">;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "admin::api-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: "strapi_api_token_permissions";
  info: {
    description: "";
    displayName: "API Token Permission";
    name: "API Token Permission";
    pluralName: "api-token-permissions";
    singularName: "api-token-permission";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::api-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    token: Attribute.Relation<
      "admin::api-token-permission",
      "manyToOne",
      "admin::api-token"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "admin::api-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: "admin_permissions";
  info: {
    description: "";
    displayName: "Permission";
    name: "Permission";
    pluralName: "permissions";
    singularName: "permission";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<"admin::permission", "manyToOne", "admin::role">;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "admin::permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: "admin_roles";
  info: {
    description: "";
    displayName: "Role";
    name: "Role";
    pluralName: "roles";
    singularName: "role";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"admin::role", "oneToOne", "admin::user"> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      "admin::role",
      "oneToMany",
      "admin::permission"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<"admin::role", "oneToOne", "admin::user"> &
      Attribute.Private;
    users: Attribute.Relation<"admin::role", "manyToMany", "admin::user">;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: "strapi_transfer_tokens";
  info: {
    description: "";
    displayName: "Transfer Token";
    name: "Transfer Token";
    pluralName: "transfer-tokens";
    singularName: "transfer-token";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::transfer-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<"">;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      "admin::transfer-token",
      "oneToMany",
      "admin::transfer-token-permission"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "admin::transfer-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: "strapi_transfer_token_permissions";
  info: {
    description: "";
    displayName: "Transfer Token Permission";
    name: "Transfer Token Permission";
    pluralName: "transfer-token-permissions";
    singularName: "transfer-token-permission";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::transfer-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    token: Attribute.Relation<
      "admin::transfer-token-permission",
      "manyToOne",
      "admin::transfer-token"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "admin::transfer-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: "admin_users";
  info: {
    description: "";
    displayName: "User";
    name: "User";
    pluralName: "users";
    singularName: "user";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"admin::user", "oneToOne", "admin::user"> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<"admin::user", "manyToMany", "admin::role"> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<"admin::user", "oneToOne", "admin::user"> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiArticleDAideArticleDAide extends Schema.CollectionType {
  collectionName: "article_d_aides";
  info: {
    description: "";
    displayName: "[AIDE] - Article d'aide";
    pluralName: "article-d-aides";
    singularName: "article-d-aide";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    contenu: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    description: Attribute.Text;
    ordre: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    section_d_aides: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "manyToMany",
      "api::section-d-aide.section-d-aide"
    >;
    slug: Attribute.String & Attribute.Required & Attribute.Unique;
    titre: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    vignette: Attribute.Media<"images"> & Attribute.Required;
  };
}

export interface ApiArticleFaqArticleFaq extends Schema.CollectionType {
  collectionName: "article_faqs";
  info: {
    description: "";
    displayName: "[FAQ] - Article FAQ";
    pluralName: "article-faqs";
    singularName: "article-faq";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-faq.article-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ordre: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    question: Attribute.String & Attribute.Required;
    reponse: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    sous_section_faq: Attribute.Relation<
      "api::article-faq.article-faq",
      "manyToOne",
      "api::sous-section-faq.sous-section-faq"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::article-faq.article-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiArticleRegionArticleRegion extends Schema.CollectionType {
  collectionName: "article_regions";
  info: {
    description: "";
    displayName: "[REGION] - Article r\u00E9gion";
    pluralName: "article-regions";
    singularName: "article-region";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    contenu: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-region.article-region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ordre: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    regions: Attribute.Relation<
      "api::article-region.article-region",
      "manyToMany",
      "api::region.region"
    >;
    resume: Attribute.Text;
    slug: Attribute.String & Attribute.Required;
    titre: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::article-region.article-region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    vignette: Attribute.Media<"images"> & Attribute.Required;
  };
}

export interface ApiDepartementDepartement extends Schema.CollectionType {
  collectionName: "departements";
  info: {
    description: "";
    displayName: "D\u00E9partement";
    pluralName: "departements";
    singularName: "departement";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::departement.departement",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    nom: Attribute.String & Attribute.Required;
    prcs: Attribute.Relation<
      "api::departement.departement",
      "oneToMany",
      "api::prc.prc"
    >;
    publishedAt: Attribute.DateTime;
    region: Attribute.Relation<
      "api::departement.departement",
      "manyToOne",
      "api::region.region"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::departement.departement",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiLegalLegal extends Schema.CollectionType {
  collectionName: "legals";
  info: {
    description: "";
    displayName: "Legal";
    pluralName: "legals";
    singularName: "legal";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    chapo: Attribute.Blocks;
    contenu: Attribute.RichText &
      Attribute.Required &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::legal.legal",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    dateDeMiseAJour: Attribute.Date & Attribute.Required;
    nom: Attribute.String & Attribute.Required;
    nouvelleVersion: Attribute.Boolean & Attribute.Required;
    publishedAt: Attribute.DateTime;
    titre: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::legal.legal",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiPrcPrc extends Schema.CollectionType {
  collectionName: "prcs";
  info: {
    description: "";
    displayName: "PRC";
    pluralName: "prcs";
    singularName: "prc";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    adresse: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"api::prc.prc", "oneToOne", "admin::user"> &
      Attribute.Private;
    departement: Attribute.Relation<
      "api::prc.prc",
      "manyToOne",
      "api::departement.departement"
    >;
    email: Attribute.Email & Attribute.Required;
    mandataire: Attribute.String;
    nom: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    region: Attribute.String;
    telephone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<"api::prc.prc", "oneToOne", "admin::user"> &
      Attribute.Private;
  };
}

export interface ApiRegionRegion extends Schema.CollectionType {
  collectionName: "regions";
  info: {
    description: "";
    displayName: "[REGION] - R\u00E9gion";
    pluralName: "regions";
    singularName: "region";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article_regions: Attribute.Relation<
      "api::region.region",
      "manyToMany",
      "api::article-region.article-region"
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::region.region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    departements: Attribute.Relation<
      "api::region.region",
      "oneToMany",
      "api::departement.departement"
    >;
    nom: Attribute.String & Attribute.Required;
    ordre: Attribute.Integer;
    prcs: Attribute.JSON;
    publishedAt: Attribute.DateTime;
    slug: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::region.region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    urlExternePRCs: Attribute.String;
    vignette: Attribute.Media<"images"> & Attribute.Required;
  };
}

export interface ApiSectionDAideSectionDAide extends Schema.CollectionType {
  collectionName: "section_d_aides";
  info: {
    description: "";
    displayName: "[AIDE] - Section d'aide";
    pluralName: "section-d-aides";
    singularName: "section-d-aide";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article_d_aides: Attribute.Relation<
      "api::section-d-aide.section-d-aide",
      "manyToMany",
      "api::article-d-aide.article-d-aide"
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::section-d-aide.section-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ordre: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    titre: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::section-d-aide.section-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiSectionFaqSectionFaq extends Schema.CollectionType {
  collectionName: "section_faqs";
  info: {
    description: "";
    displayName: "[FAQ] - Section FAQ";
    pluralName: "section-faqs";
    singularName: "section-faq";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::section-faq.section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ordre: Attribute.Integer;
    pictogramme: Attribute.Enumeration<
      [
        "airport",
        "application",
        "avatar",
        "book",
        "calendar",
        "cityHall",
        "coding",
        "community",
        "connectionLost",
        "contract",
        "culture",
        "dataVisualization",
        "digitalArt",
        "document",
        "documentDownload",
        "documentSignature",
        "drivingLicence",
        "environment",
        "error",
        "factory",
        "firefighter",
        "food",
        "gendarmerie",
        "grocery",
        "health",
        "hospital",
        "house",
        "humanCooperation",
        "information",
        "internet",
        "justice",
        "leaf",
        "locationFrance",
        "luggage",
        "mailSend",
        "map",
        "money",
        "moon",
        "mountain",
        "nationalIdentityCard",
        "notification",
        "nuclearPlant",
        "padlock",
        "paint",
        "passport",
        "police",
        "school",
        "search",
        "success",
        "sun",
        "system",
        "taxStamp",
        "technicalError",
        "tree",
        "vaccine",
        "vehicleRegistration",
        "virus",
        "warning",
      ]
    >;
    publishedAt: Attribute.DateTime;
    sous_section_faqs: Attribute.Relation<
      "api::section-faq.section-faq",
      "oneToMany",
      "api::sous-section-faq.sous-section-faq"
    >;
    titre: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::section-faq.section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiSousSectionFaqSousSectionFaq extends Schema.CollectionType {
  collectionName: "sous_section_faqs";
  info: {
    description: "";
    displayName: "[FAQ] - Sous-section FAQ";
    pluralName: "sous-section-faqs";
    singularName: "sous-section-faq";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article_faqs: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToMany",
      "api::article-faq.article-faq"
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ordre: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    section_faq: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "manyToOne",
      "api::section-faq.section-faq"
    >;
    titre: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: "strapi_releases";
  info: {
    displayName: "Release";
    pluralName: "releases";
    singularName: "release";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      "plugin::content-releases.release",
      "oneToMany",
      "plugin::content-releases.release-action"
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::content-releases.release",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ["ready", "blocked", "failed", "done", "empty"]
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::content-releases.release",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: "strapi_release_actions";
  info: {
    displayName: "Release Action";
    pluralName: "release-actions";
    singularName: "release-action";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::content-releases.release-action",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      "plugin::content-releases.release-action",
      "morphToOne"
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      "plugin::content-releases.release-action",
      "manyToOne",
      "plugin::content-releases.release"
    >;
    type: Attribute.Enumeration<["publish", "unpublish"]> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::content-releases.release-action",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: "i18n_locale";
  info: {
    collectionName: "locales";
    description: "";
    displayName: "Locale";
    pluralName: "locales";
    singularName: "locale";
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::i18n.locale",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::i18n.locale",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: "files";
  info: {
    description: "";
    displayName: "File";
    pluralName: "files";
    singularName: "file";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::upload.file",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      "plugin::upload.file",
      "manyToOne",
      "plugin::upload.folder"
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<"plugin::upload.file", "morphToMany">;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::upload.file",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: "upload_folders";
  info: {
    displayName: "Folder";
    pluralName: "folders";
    singularName: "folder";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      "plugin::upload.folder",
      "oneToMany",
      "plugin::upload.folder"
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::upload.folder",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    files: Attribute.Relation<
      "plugin::upload.folder",
      "oneToMany",
      "plugin::upload.file"
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      "plugin::upload.folder",
      "manyToOne",
      "plugin::upload.folder"
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::upload.folder",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: "up_permissions";
  info: {
    description: "";
    displayName: "Permission";
    name: "permission";
    pluralName: "permissions";
    singularName: "permission";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    role: Attribute.Relation<
      "plugin::users-permissions.permission",
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::users-permissions.permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: "up_roles";
  info: {
    description: "";
    displayName: "Role";
    name: "role";
    pluralName: "roles";
    singularName: "role";
  };
  pluginOptions: {
    "content-manager": {
      visible: false;
    };
    "content-type-builder": {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToMany",
      "plugin::users-permissions.permission"
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    users: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToMany",
      "plugin::users-permissions.user"
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: "up_users";
  info: {
    description: "";
    displayName: "User";
    name: "user";
    pluralName: "users";
    singularName: "user";
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.user",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      "plugin::users-permissions.user",
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      "plugin::users-permissions.user",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module "@strapi/types" {
  export module Shared {
    export interface ContentTypes {
      "admin::api-token": AdminApiToken;
      "admin::api-token-permission": AdminApiTokenPermission;
      "admin::permission": AdminPermission;
      "admin::role": AdminRole;
      "admin::transfer-token": AdminTransferToken;
      "admin::transfer-token-permission": AdminTransferTokenPermission;
      "admin::user": AdminUser;
      "api::article-d-aide.article-d-aide": ApiArticleDAideArticleDAide;
      "api::article-faq.article-faq": ApiArticleFaqArticleFaq;
      "api::article-region.article-region": ApiArticleRegionArticleRegion;
      "api::departement.departement": ApiDepartementDepartement;
      "api::legal.legal": ApiLegalLegal;
      "api::prc.prc": ApiPrcPrc;
      "api::region.region": ApiRegionRegion;
      "api::section-d-aide.section-d-aide": ApiSectionDAideSectionDAide;
      "api::section-faq.section-faq": ApiSectionFaqSectionFaq;
      "api::sous-section-faq.sous-section-faq": ApiSousSectionFaqSousSectionFaq;
      "plugin::content-releases.release": PluginContentReleasesRelease;
      "plugin::content-releases.release-action": PluginContentReleasesReleaseAction;
      "plugin::i18n.locale": PluginI18NLocale;
      "plugin::upload.file": PluginUploadFile;
      "plugin::upload.folder": PluginUploadFolder;
      "plugin::users-permissions.permission": PluginUsersPermissionsPermission;
      "plugin::users-permissions.role": PluginUsersPermissionsRole;
      "plugin::users-permissions.user": PluginUsersPermissionsUser;
    }
  }
}
