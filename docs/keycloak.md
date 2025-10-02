# Keycloak

## Vue d'ensemble

Keycloak est le fournisseur OpenID Connect (OIDC) / OAuth2 pour toutes les applications et services :
- Les clients publics (applications Next.js) suivent le flux Authorization Code.
- Les clients privés s’authentifient avec un secret.

## Jetons et en-têtes

- Keycloak renvoie trois JWT (ID, Access, Refresh).
- L'Access Token transite en `Bearer` dans les requêtes HTTP. Il est renouvelé toutes les 30 secondes.

## Rôles métiers principaux

- `admin`
- `manage_candidacy`
- `manage_feasibility`
- `gestion_maison_mere_aap`
- `manage_certification_authority_local_account`
- `manage_certification_registry`
- `manage_vae_collective`
- `candidate`

## Librairies utilisées

- `keycloak-js` coté applications Next.js.
- `keycloak-connect` coté services.