# REVA

## Setup

```bash
npm install
```

It will install node modules in both `packages/reva-app` and `packages/reva-website`

For the mobile app, create a `.env` file:

```
cp packages/reva-app/.env.example packages/reva-app/.env
```

Then set your local ip in this `.env` file.

### Api

Dans le fichier `.env` à la racine du projet, ajouter la ligne

```
DATABASE_URL=postgresql://reva:password@localhost:5444/reva?schema=public
```

Ajouter cette même ligne dans le fichier `./packages/reva-api/.env`

Aller dans le dossier `./packages/reva-api/` et exécuter :

```
npx prisma migrate dev
npx prisma generate
```

## Run

### Run web api

```bash
npm run dev -w reva-api
```

### Run web app

```bash
npm run dev -w reva-app
```

### Run mobile app

```bash
npm run dev:mobile -w reva-app
```

Run the web app (see above) then open your native IDE:

```bash
cd packages/reva-app
npx cap open ios
```

or

```bash
cd packages/reva-app
npx cap open android
```

Then click the Run button to launch the app in the mobile simulator.

### Run Storybook

```bash
npm run storybook -w reva-app
```

### Générer les icones et splash screens mobile

```bash
npm run build:resources -w reva-app
```
