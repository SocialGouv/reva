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
  #   image: quay.io/keycloak/keycloak:24.0.2
  #   volumes:
  #     - ./themes/francevae:/opt/keycloak/themes/francevae
  #   environment:
  #     KC_HEALTH_ENABLED: true
  #     KC_METRICS_ENABLED: true
  #     KC_DB: postgres
  #     KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
  #     KC_DB_USERNAME: keycloak
  #     KC_DB_PASSWORD: password
  #     KC_HOSTNAME: localhost
  #     KC_PROXY: edge
  #     # KC_HOSTNAME_STRICT: false
  #     # KC_HOSTNAME_STRICT_BACKCHANNEL: true
  #     KEYCLOAK_ADMIN: admin
  #     KEYCLOAK_ADMIN_PASSWORD: password
  #     REVA_BASE_URL: http://localhost:3000
  #     KC_HTTP_RELATIVE_PATH: auth
  #     KC_HTTP_ENABLED: true
  #     KC_HOSTNAME_STRICT_HTTPS: false
  #     # Uncomment the line below if you want to specify JDBC parameters. The parameter below is just an example, and it shouldn't be used in production without knowledge. It is highly recommended that you read the PostgreSQL JDBC driver documentation in order to use it.
  #     # JDBC_PARAMS: "ssl=true"
  #   command:
  #     - start
  #     # - --optimized
  #     - --hostname-port=8888
  #   ports:
  #     - 8888:8080
  #   depends_on:
  #     - postgres
```

Puis lancer le service de la db:

```
$ cd infra/keycloak
$ docker-compose up -d
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
    image: quay.io/keycloak/keycloak:24.0.2
    volumes:
      - ./themes/francevae:/opt/keycloak/themes/francevae
    environment:
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: password
      KC_HOSTNAME: localhost
      KC_PROXY: edge
      # KC_HOSTNAME_STRICT: false
      # KC_HOSTNAME_STRICT_BACKCHANNEL: true
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: password
      REVA_BASE_URL: http://localhost:3000
      KC_HTTP_RELATIVE_PATH: auth
      KC_HTTP_ENABLED: true
      KC_HOSTNAME_STRICT_HTTPS: false
      # Uncomment the line below if you want to specify JDBC parameters. The parameter below is just an example, and it shouldn't be used in production without knowledge. It is highly recommended that you read the PostgreSQL JDBC driver documentation in order to use it.
      # JDBC_PARAMS: "ssl=true"
    command:
      - start
      # - --optimized
      - --hostname-port=8888
    ports:
      - 8888:8080
    depends_on:
      - postgres
```

Puis lancer le service de la db:

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
