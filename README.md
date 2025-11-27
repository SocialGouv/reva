# France VAE

https://vae.gouv.fr

## Introduction

REVA est un monorepo qui regroupe :
- les API et applications France VAE (dans `packages/*`).
- ses composants comme Keycloak, Metabase et Strapi (dans `infra/*`).

## Stack technique

- API : Fastify pour `reva-api` (GraphQL avec Mercurius + Prisma) et `reva-interop` (REST).
- Applications web : Next.js pour toutes les apps, design system DSFR.
- GraphQL : clients URQL et `graphql-request`, types générés via `graphql-codegen`.
- Données : PostgreSQL, Outscale et FTPS.
- Authentification : Keycloak (`keycloak-js` côté apps, `keycloak-connect` côté API).
- Proxy et routage : Traefik.
- Tests : Vitest (API), Cypress (admin et candidat) et Playwright (website, candidat et VAE collective).
- Observabilité : Datadog et Metabase.
- Emails : Brevo.
- CMS : Strapi (contenus du site vitrine, de l'app candidat et du back-office).

## Packages

### Applications Next.js

- `packages/reva-admin-react`: Back-office métier pour l'équipe France VAE, les certificateurs et les organismes.
- `packages/reva-candidate`: Application pour les candidats (dépôt de candidature, dossier de faisabilité, jury, etc.).
- `packages/reva-vae-collective`: Portail dédié aux porteurs de projets de VAE collective.
- `packages/reva-website`: Site vitrine France VAE.

### Services

- `packages/reva-api`: API GraphQL interne, traitements planifiés (cron) et transfert de fichiers.
- `packages/reva-interop`: API REST d'interopérabilité exposée à des acteurs externes.

## Mise en route

1. Installer Node.js 22 et npm.
2. Cloner le dépôt puis installer les dépendances : `npm ci`.
3. Initialiser la configuration : copier les `.env.example` vers `.env` et compléter les secrets.
4. Appliquer les migrations Prisma : `npm run prisma:migrate:deploy`.
5. Démarrer l’ensemble API + fronts : `npm run dev`.

Voir les scripts dans les `package.json` pour plus de détails.

## En savoir plus

- [docs/keycloak.md](docs/keycloak.md)
