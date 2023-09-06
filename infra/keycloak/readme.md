# Utilisation de Keycloak en local

## Adapter les .env

Les variables d'environnement doivent pointer sur le Keycloak local (port 8888) avec les bon secrets.

Demander le fichier .env avec les variables d'env à utiliser.

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

### Builder l'image Keycloak version 18.0.2

```
$ cd infra/keycloak/docker
$ docker build -t reva/keycloak:18.0.2 .
```

Si le build s'est correctement fait l'image doit être visible avec la commande suivante:

```
$ docker images
```

Output

```shell
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
reva/keycloak            18.0.2    c382e0257c88   27 seconds ago   725MB
```

### Démarrer le service

Avant de lancer le Keycloak, il est nécessaire d'utiliser un dump récent d'une db postgres Keycloak.
Demander le dump avant de démarrer.

```
$ cd infra/keycloak
```

Dans le fichier `docker-compose.yml` commenter le service `keycloak`:

```yaml
version: "3"

volumes:
  postgres_data:
    driver: local

services:
  postgres:
    image: postgres:13.7
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: password
    ports:
      - 5433:5432
  # keycloak:
  #   build:
  #     context: .
  #     dockerfile: Dockerfile.local
  #   volumes:
  #     - ./themes/francevae:/opt/jboss/keycloak/themes/francevae
  #   environment:
  #     DB_VENDOR: postgres
  #     DB_ADDR: postgres
  #     DB_DATABASE: keycloak
  #     DB_USER: keycloak
  #     DB_SCHEMA: public
  #     DB_PASSWORD: password
  #     KEYCLOAK_USER: admin
  #     KEYCLOAK_PASSWORD: password
  #     REVA_BASE_URL: http://localhost:3002
  #     # Uncomment the line below if you want to specify JDBC parameters. The parameter below is just an example, and it shouldn't be used in production without knowledge. It is highly recommended that you read the PostgreSQL JDBC driver documentation in order to use it.
  #     # JDBC_PARAMS: "ssl=true"
  #   ports:
  #     - 8888:8080
  #   depends_on:
  #     - postgres
```

Puis lancer le service de la db:

```
$ cd infra/keycloak
$ docker-compose up -d --build
```

Une db postgres est désormais lancée. Il suffit de restaurer le dump fourni.

Enfin démarrer la stack en retirant le service `keycloak` en commentaire:

```yaml
version: "3"

volumes:
  postgres_data:
    driver: local

services:
  postgres:
    image: postgres:13.7
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: password
    ports:
      - 5433:5432
  keycloak:
    build:
      context: .
      dockerfile: Dockerfile.local
    volumes:
      - ./themes/francevae:/opt/jboss/keycloak/themes/francevae
    environment:
      DB_VENDOR: postgres
      DB_ADDR: postgres
      DB_DATABASE: keycloak
      DB_USER: keycloak
      DB_SCHEMA: public
      DB_PASSWORD: password
      KEYCLOAK_USER: admin
      KEYCLOAK_PASSWORD: password
      REVA_BASE_URL: http://localhost:3002
      # Uncomment the line below if you want to specify JDBC parameters. The parameter below is just an example, and it shouldn't be used in production without knowledge. It is highly recommended that you read the PostgreSQL JDBC driver documentation in order to use it.
      # JDBC_PARAMS: "ssl=true"
    ports:
      - 8888:8080
    depends_on:
      - postgres
```

Puis lancer le service de la db:

```
$ cd infra/keycloak
$ docker-compose up -d --build
```

Vérifier que les containers docker sont bien actifs.

```
$ docker ps
```

Output

```shell
CONTAINER ID   IMAGE               COMMAND                  CREATED         STATUS         PORTS                              NAMES
b57be878ca79   keycloak-keycloak   "/opt/jboss/tools/do…"   3 seconds ago   Up 2 seconds   8443/tcp, 0.0.0.0:8888->8080/tcp   keycloak-keycloak-1
02f22c25ffce   postgres:13.7       "docker-entrypoint.s…"   7 minutes ago   Up 7 minutes   0.0.0.0:5433->5432/tcp             keycloak-postgres-1
bb5ba00b8bda   postgres            "docker-entrypoint.s…"   8 days ago      Up 45 hours    0.0.0.0:5444->5432/tcp             postgresql_reva
```

Et voilà ! La stack est lancée.
