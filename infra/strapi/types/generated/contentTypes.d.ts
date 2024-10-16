import type { Schema, Attribute } from "@strapi/strapi";

export interface AdminPermission extends Schema.CollectionType {
  collectionName: "admin_permissions";
  info: {
    name: "Permission";
    description: "";
    singularName: "permission";
    pluralName: "permissions";
    displayName: "Permission";
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
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<"admin::permission", "manyToOne", "admin::role">;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "admin::permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: "admin_users";
  info: {
    name: "User";
    description: "";
    singularName: "user";
    pluralName: "users";
    displayName: "User";
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
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<"admin::user", "manyToMany", "admin::role"> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"admin::user", "oneToOne", "admin::user"> &
      Attribute.Private;
    updatedBy: Attribute.Relation<"admin::user", "oneToOne", "admin::user"> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: "admin_roles";
  info: {
    name: "Role";
    description: "";
    singularName: "role";
    pluralName: "roles";
    displayName: "Role";
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<"admin::role", "manyToMany", "admin::user">;
    permissions: Attribute.Relation<
      "admin::role",
      "oneToMany",
      "admin::permission"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"admin::role", "oneToOne", "admin::user"> &
      Attribute.Private;
    updatedBy: Attribute.Relation<"admin::role", "oneToOne", "admin::user"> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: "strapi_api_tokens";
  info: {
    name: "Api Token";
    singularName: "api-token";
    pluralName: "api-tokens";
    displayName: "Api Token";
    description: "";
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<"">;
    type: Attribute.Enumeration<["read-only", "full-access", "custom"]> &
      Attribute.Required &
      Attribute.DefaultTo<"read-only">;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      "admin::api-token",
      "oneToMany",
      "admin::api-token-permission"
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::api-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    name: "API Token Permission";
    description: "";
    singularName: "api-token-permission";
    pluralName: "api-token-permissions";
    displayName: "API Token Permission";
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
    token: Attribute.Relation<
      "admin::api-token-permission",
      "manyToOne",
      "admin::api-token"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::api-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "admin::api-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: "strapi_transfer_tokens";
  info: {
    name: "Transfer Token";
    singularName: "transfer-token";
    pluralName: "transfer-tokens";
    displayName: "Transfer Token";
    description: "";
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<"">;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      "admin::transfer-token",
      "oneToMany",
      "admin::transfer-token-permission"
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::transfer-token",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    name: "Transfer Token Permission";
    description: "";
    singularName: "transfer-token-permission";
    pluralName: "transfer-token-permissions";
    displayName: "Transfer Token Permission";
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
    token: Attribute.Relation<
      "admin::transfer-token-permission",
      "manyToOne",
      "admin::transfer-token"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "admin::transfer-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "admin::transfer-token-permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: "files";
  info: {
    singularName: "file";
    pluralName: "files";
    displayName: "File";
    description: "";
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
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<"plugin::upload.file", "morphToMany">;
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
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::upload.file",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "plugin::upload.file",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: "upload_folders";
  info: {
    singularName: "folder";
    pluralName: "folders";
    displayName: "Folder";
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      "plugin::upload.folder",
      "manyToOne",
      "plugin::upload.folder"
    >;
    children: Attribute.Relation<
      "plugin::upload.folder",
      "oneToMany",
      "plugin::upload.folder"
    >;
    files: Attribute.Relation<
      "plugin::upload.folder",
      "oneToMany",
      "plugin::upload.file"
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::upload.folder",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "plugin::upload.folder",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: "strapi_releases";
  info: {
    singularName: "release";
    pluralName: "releases";
    displayName: "Release";
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
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ["ready", "blocked", "failed", "done", "empty"]
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      "plugin::content-releases.release",
      "oneToMany",
      "plugin::content-releases.release-action"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::content-releases.release",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    singularName: "release-action";
    pluralName: "release-actions";
    displayName: "Release Action";
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
    type: Attribute.Enumeration<["publish", "unpublish"]> & Attribute.Required;
    entry: Attribute.Relation<
      "plugin::content-releases.release-action",
      "morphToOne"
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      "plugin::content-releases.release-action",
      "manyToOne",
      "plugin::content-releases.release"
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::content-releases.release-action",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    singularName: "locale";
    pluralName: "locales";
    collectionName: "locales";
    displayName: "Locale";
    description: "";
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
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::i18n.locale",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "plugin::i18n.locale",
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
    name: "permission";
    description: "";
    singularName: "permission";
    pluralName: "permissions";
    displayName: "Permission";
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
    role: Attribute.Relation<
      "plugin::users-permissions.permission",
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.permission",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    name: "role";
    description: "";
    singularName: "role";
    pluralName: "roles";
    displayName: "Role";
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
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToMany",
      "plugin::users-permissions.permission"
    >;
    users: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToMany",
      "plugin::users-permissions.user"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "plugin::users-permissions.role",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: "up_users";
  info: {
    name: "user";
    description: "";
    singularName: "user";
    pluralName: "users";
    displayName: "User";
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      "plugin::users-permissions.user",
      "manyToOne",
      "plugin::users-permissions.role"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "plugin::users-permissions.user",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "plugin::users-permissions.user",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiArticleAapArticleAap extends Schema.CollectionType {
  collectionName: "article_aaps";
  info: {
    singularName: "article-aap";
    pluralName: "article-aaps";
    displayName: "Article AAP";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String;
    slug: Attribute.String;
    contenu: Attribute.Blocks & Attribute.Required;
    pj: Attribute.Media<"images" | "files" | "videos" | "audios", true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-aap.article-aap",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::article-aap.article-aap",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiArticleDAideArticleDAide extends Schema.CollectionType {
  collectionName: "article_d_aides";
  info: {
    singularName: "article-d-aide";
    pluralName: "article-d-aides";
    displayName: "[AIDE] - Article d'aide";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String & Attribute.Required;
    vignette: Attribute.Media<"images"> & Attribute.Required;
    section_d_aides: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "manyToMany",
      "api::section-d-aide.section-d-aide"
    >;
    description: Attribute.Text;
    contenu: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    ordre: Attribute.Integer;
    slug: Attribute.String & Attribute.Required & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::article-d-aide.article-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiArticleFaqArticleFaq extends Schema.CollectionType {
  collectionName: "article_faqs";
  info: {
    singularName: "article-faq";
    pluralName: "article-faqs";
    displayName: "[FAQ] - Article FAQ";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    question: Attribute.String & Attribute.Required;
    sous_section_faq: Attribute.Relation<
      "api::article-faq.article-faq",
      "manyToOne",
      "api::sous-section-faq.sous-section-faq"
    >;
    reponse: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    ordre: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-faq.article-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    singularName: "article-region";
    pluralName: "article-regions";
    displayName: "[REGION] - Article r\u00E9gion";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String & Attribute.Required;
    slug: Attribute.String & Attribute.Required;
    resume: Attribute.Text;
    contenu: Attribute.RichText &
      Attribute.CustomField<
        "plugin::ckeditor.CKEditor",
        {
          output: "HTML";
          preset: "rich";
        }
      >;
    vignette: Attribute.Media<"images"> & Attribute.Required;
    ordre: Attribute.Integer;
    regions: Attribute.Relation<
      "api::article-region.article-region",
      "manyToMany",
      "api::region.region"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::article-region.article-region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::article-region.article-region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiDepartementDepartement extends Schema.CollectionType {
  collectionName: "departements";
  info: {
    singularName: "departement";
    pluralName: "departements";
    displayName: "D\u00E9partement";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    nom: Attribute.String & Attribute.Required;
    code: Attribute.String & Attribute.Required;
    prcs: Attribute.Relation<
      "api::departement.departement",
      "oneToMany",
      "api::prc.prc"
    >;
    region: Attribute.Relation<
      "api::departement.departement",
      "manyToOne",
      "api::region.region"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::departement.departement",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::departement.departement",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiPrcPrc extends Schema.CollectionType {
  collectionName: "prcs";
  info: {
    singularName: "prc";
    pluralName: "prcs";
    displayName: "PRC";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    nom: Attribute.String & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
    adresse: Attribute.String & Attribute.Required;
    region: Attribute.String;
    telephone: Attribute.String;
    mandataire: Attribute.String;
    departement: Attribute.Relation<
      "api::prc.prc",
      "manyToOne",
      "api::departement.departement"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<"api::prc.prc", "oneToOne", "admin::user"> &
      Attribute.Private;
    updatedBy: Attribute.Relation<"api::prc.prc", "oneToOne", "admin::user"> &
      Attribute.Private;
  };
}

export interface ApiRegionRegion extends Schema.CollectionType {
  collectionName: "regions";
  info: {
    singularName: "region";
    pluralName: "regions";
    displayName: "[REGION] - R\u00E9gion";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    nom: Attribute.String & Attribute.Required;
    slug: Attribute.String & Attribute.Required;
    vignette: Attribute.Media<"images"> & Attribute.Required;
    urlExternePRCs: Attribute.String;
    prcs: Attribute.JSON;
    ordre: Attribute.Integer;
    article_regions: Attribute.Relation<
      "api::region.region",
      "manyToMany",
      "api::article-region.article-region"
    >;
    departements: Attribute.Relation<
      "api::region.region",
      "oneToMany",
      "api::departement.departement"
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::region.region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::region.region",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

export interface ApiSectionDAideSectionDAide extends Schema.CollectionType {
  collectionName: "section_d_aides";
  info: {
    singularName: "section-d-aide";
    pluralName: "section-d-aides";
    displayName: "[AIDE] - Section d'aide";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String;
    article_d_aides: Attribute.Relation<
      "api::section-d-aide.section-d-aide",
      "manyToMany",
      "api::article-d-aide.article-d-aide"
    >;
    ordre: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::section-d-aide.section-d-aide",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    singularName: "section-faq";
    pluralName: "section-faqs";
    displayName: "[FAQ] - Section FAQ";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String & Attribute.Required;
    sous_section_faqs: Attribute.Relation<
      "api::section-faq.section-faq",
      "oneToMany",
      "api::sous-section-faq.sous-section-faq"
    >;
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
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::section-faq.section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
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
    singularName: "sous-section-faq";
    pluralName: "sous-section-faqs";
    displayName: "[FAQ] - Sous-section FAQ";
    description: "";
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    titre: Attribute.String & Attribute.Required;
    section_faq: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "manyToOne",
      "api::section-faq.section-faq"
    >;
    article_faqs: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToMany",
      "api::article-faq.article-faq"
    >;
    ordre: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      "api::sous-section-faq.sous-section-faq",
      "oneToOne",
      "admin::user"
    > &
      Attribute.Private;
  };
}

declare module "@strapi/types" {
  export module Shared {
    export interface ContentTypes {
      "admin::permission": AdminPermission;
      "admin::user": AdminUser;
      "admin::role": AdminRole;
      "admin::api-token": AdminApiToken;
      "admin::api-token-permission": AdminApiTokenPermission;
      "admin::transfer-token": AdminTransferToken;
      "admin::transfer-token-permission": AdminTransferTokenPermission;
      "plugin::upload.file": PluginUploadFile;
      "plugin::upload.folder": PluginUploadFolder;
      "plugin::content-releases.release": PluginContentReleasesRelease;
      "plugin::content-releases.release-action": PluginContentReleasesReleaseAction;
      "plugin::i18n.locale": PluginI18NLocale;
      "plugin::users-permissions.permission": PluginUsersPermissionsPermission;
      "plugin::users-permissions.role": PluginUsersPermissionsRole;
      "plugin::users-permissions.user": PluginUsersPermissionsUser;
      "api::article-aap.article-aap": ApiArticleAapArticleAap;
      "api::article-d-aide.article-d-aide": ApiArticleDAideArticleDAide;
      "api::article-faq.article-faq": ApiArticleFaqArticleFaq;
      "api::article-region.article-region": ApiArticleRegionArticleRegion;
      "api::departement.departement": ApiDepartementDepartement;
      "api::prc.prc": ApiPrcPrc;
      "api::region.region": ApiRegionRegion;
      "api::section-d-aide.section-d-aide": ApiSectionDAideSectionDAide;
      "api::section-faq.section-faq": ApiSectionFaqSectionFaq;
      "api::sous-section-faq.sous-section-faq": ApiSousSectionFaqSousSectionFaq;
    }
  }
}
