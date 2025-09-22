# API Interopérabilité France VAE - v1

Les routes présentées ci-dessous sont utilisables directement avec `curl`, ou via la collection [Bruno](https://github.com/usebruno/bruno) disponible [ici](https://github.com/SocialGouv/reva/tree/master/packages/reva-interop/bruno), et qu'il suffit d'importer dans l'outil (et renseigner les variables telles que le JWT et AUTH_API_KEY).

## Création d'un compte utilisateur et génération de token

La création d'accès à l'API pour un nouvel utilisateur se déroule en deux étapes :

1. Création du compte utilisateur (DB et Keycloak)
2. Génération d'un JWT lié à son compte

Afin de faciliter ce travail, l'API interopérabilité expose deux routes, accessibles uniquement aux administrateurs.

> [!WARNING]
> La base de donnée de l'environnement de bac à sable est restaurée chaque nuit à partir d'un backup. Lors de l'ajout d'un utilisateur dans le bac à sable, il est primordial de lancer un backup manuel, récupérer son ID, et le mettre dans la variable d'environnement `SANDBOX_BACKUP_ID` de l'app sandbox-api. Sans cela, l'utilisateur nouvellement ajouté serait supprimé automatiquement le lendemain.

### Récupérer votre JWT Administrateur

La première étape est d'obtenir un JWT associé à son compte administrateur France VAE. Nécessaire une seule fois.
D'abord, obtenir son ID Keycloak. Ensuite, appeler la route de génération de token :

```bash
curl -X 'POST' \
  'http://localhost:3006/interop/v1/auth/generateJwt' \
  -H 'accept: application/json' \
  -H 'auth_api_key: <AUTH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}'
```

Ne pas oublier de rempalcer l'adresse de l'API, la clé `AUTH_API_KEY`, et l'ID utilisateur par les valeurs appropriées.
Sauvegarder en lieu sûr le JWT ainsi récupéré.

### Créer le compte du nouvel utilisateur

Appeler la route suivante, en insérant son JWT administrateur, et en complétant les coordonnées du nouvel utilisateur

```bash
curl -X 'POST' \
  'http://localhost:3006/interop/v1/auth/createAccount' \
  -H 'accept: application/json' \
    -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{
  "certificationAuthorityId": "<ID_CERTIFICATEUR>",
  "email": "<EMAIL>",
  "firstname": "<PRENOM>",
  "lastname": "<NOM>",
  "username": "<USERNAME(USE EMAIL)>"
}'
```

Si la création a abouti, la route renvoie l'identifiant de l'utilisateur nouvellement créé.

### Générer un JWT pour un utilisateur

Récupérer l'identifiant de l'utilisateur (par exemple renvoyé par la route ci-dessus), et effectuer un appel à cette route :

```bash
curl -X 'POST' \
  'http://localhost:3006/interop/v1/auth/generateJwt' \
  -H 'accept: application/json' \
  -H 'auth_api_key: <AUTH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}'
```

Ne pas oublier de rempalcer l'adresse de l'API, la clé `AUTH_API_KEY`, et l'ID utilisateur par les valeurs appropriées.
Si tout s'est bien passé, la requête retourne un JWT pour l'utilisateur choisi.

> [!WARNING]
> Si l'utilisateur a été ajouté dans le bac à sable, ne pas oublier lancer un backup manuel de la DB sandbox api, récupérer son ID, et le mettre dans la variable d'environnement `SANDBOX_BACKUP_ID` de l'app sandbox-api. Sans cela, l'utilisateur nouvellement ajouté serait supprimé automatiquement le lendemain.
