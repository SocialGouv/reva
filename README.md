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

## Run

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
