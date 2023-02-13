#!/bin/bash

npm run build --workspaces --if-present
npm i --prefix "./packages/reva-website"
npm run build --prefix "./packages/reva-website"