# Utilisation de Keycloak en local

### TODO : faire l'import des `.json` avec `--import` ou `KEYCLOAK_IMPORT`

https://github.com/keycloak/keycloak/issues/10216

## Adapter les .env

Les variables d'environnement doivent pointer sur le Keycloak local (port 8888) avec les bon secrets.

### `.env` racine

```properties
KEYCLOAK_ADMIN_URL=http://localhost:8888/auth

KEYCLOAK_ADMIN_CLIENT_SECRET=R3PgiY0teVENQj3mjhyTsd6Wabsc3T3s

KEYCLOAK_ADMIN_REALM_REVA_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtpSPQu1PqzjOb0StkilxmAAKmJpjF6z8X0gQg1Uc1jZcHU5HoPZhpX0wV0su+GD8US0EZngd4d0Mk+O3gkm78q8TB/IUf8vdvEzUJUEv8cgK/cSAr8MCQgaSsdKnIkktOqGoI3Iqj+N2YypgLmefjqffD8bt01OUv0THlTyM7+xCBJOfOP3XeyMnIENemea4t7wM7e4r1UAnp4KhAe0sGET4Zk/uvDGn8xU5sHhgdm7C8+MrR5R09GjBfYHyIibDWoFpvbTDv/yUwbcgZ+lGxSvVPU8gQv9w+SzOscIlVZDAdtaH1NKXsVFHpMx022SIqY3S+rwPYPRUz9hNseGuAwIDAQAB

KEYCLOAK_APP_REALM_REVA_APP_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAus/sBCWIV7w03plcQRZMfOLqItW53ofhjj2975lsshItVBn3XEEKzhx4nG1pCqfjjbUSF72riBoHTvHc7lrTebiqWaxKQlZWV8R0BYKugYtNISZ2i2Wz8eSwF3tmWHD94CgyH/t16qmoL/erBy8plY7bBBhc7zSOofOc0uhirrLVrtKRW6meauudfqG94q0Sc72dhZN2UEH72cNSkhVe6MHxKaoox75PvvwgQTzp8NNEeoQdsm2OOetvU1TN0JqHtsMMz8s9Z4nfKKHzkuUEPQm3R+C9e77IZs2Qi13L0o446UZZQkkS+vnDA39aeIwZV9NXwljH1/lrb+lUAc6gYQIDAQAB

KEYCLOAK_APP_ADMIN_CLIENT_SECRET=xCBB1pXGglNTDl1B4UbYgvhdhyLZMwX1

REACT_APP_KEYCLOAK_URL=http://localhost:8888/auth

VITE_KEYCLOAK_URL=http://localhost:8888/auth
```

### `packages/reva-admin/.env`

```properties
VITE_KEYCLOAK_URL=http://localhost:8888/auth
```

### `packages/reva-app/.env`

```properties
REACT_APP_KEYCLOAK_URL=http://localhost:8888/auth
```

## Lancer Keycloak

```
$ cd infra/keycloak
$ docker-compose up -d
$ docker-compose logs -f
```

Les données des Realms `reva-app` et `reva-admin` sont chargées et un utilisateur `admin` est créé pour se connecter à la console Keycloak.

Il faudra ensuite créer des utilisateurs Reva (cf https://www.notion.so/fabnummas/Cr-ation-de-compte-pour-le-Back-Office-8123b5af3242427ab4d62f6075e41b99)

## Lancer les applis Reva avec le nouvel environnement

```
$ npm run dev
```
