# Utilisation de Keycloak en local

## Adapter les .env

Les variables d'environnement doivent pointer sur le Keycloak local (port 8888) avec les bon secrets.

Demander le fichier .env avec les variables d'env à utiliser.

Si un autre keycloak était utilisé seule les urls changent (attention au protocole et au /auth en plus): https://mon-keycloak-reva.net/ -> http://localhost:8888/auth

### `.env` racine

```properties
KEYCLOAK_ADMIN_URL=http://localhost:8888/auth

KEYCLOAK_ADMIN_CLIENT_SECRET=

KEYCLOAK_ADMIN_REALM_REVA_PUBLIC_KEY=

KEYCLOAK_APP_REALM_REVA_APP_PUBLIC_KEY=

KEYCLOAK_APP_ADMIN_CLIENT_SECRET=

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

### Démarrer le service

Avant de lancer le Keycloak, il est nécessaire d'utiliser un dump récent d'une db postgres Keycloak.
Demander le dump avant de démarrer.

```
$ cd infra/keycloak
```

Dans le fichier `docker-compose.yml` commenter le service `keycloak`:

Puis lancer le service de la db:

```
$ cd infra/keycloak
$ docker-compose up -d postgres
```

Une db postgres est désormais lancée. Il suffit de restaurer le dump fourni.

Enfin démarrer le reste de la stack

```
$ cd infra/keycloak
$ docker-compose up -d
```

Vérifier que les containers docker sont bien actifs.

```
$ docker ps
```

Output

```shell
CONTAINER ID   IMAGE                              COMMAND                  CREATED          STATUS          PORTS                              NAMES
a01d872995b6   quay.io/keycloak/keycloak:24.0.2   "/opt/keycloak/bin/k…"   47 minutes ago   Up 47 minutes   8443/tcp, 0.0.0.0:8888->8080/tcp   keycloak-keycloak-1
d01bb1f74931   postgres:13.7                      "docker-entrypoint.s…"   50 minutes ago   Up 50 minutes   0.0.0.0:5433->5432/tcp             keycloak-postgres-1
```

Et voilà ! La stack est lancée.

L'interface d'admin est accessible sur l'url suivante : http://localhost:8888/auth
