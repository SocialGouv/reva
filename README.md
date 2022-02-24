# REVA

## Setup

```bash
npm install
```

It will install node modules both in `packages/reva-app` and `packages/reva-website`

For the mobile app, create a `.env` file:

```
cp packages/reva-app/.env.example packages/reva-app/.env
```

Then set your local ip in this `.env` file.

## Run

### Run web app

```bash
cd packages/reva-app
npm run dev
```

### Run mobile app

Run the web app (see above) then open your native IDE:

```
npx cap open ios
```

or

```
npx cap open android
```

Then click the Run button to launch the app in the mobile simulator.
