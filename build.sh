#!/bin/bash

npm run build --workspaces --if-present
npm i --prefix "./packages/reva-website"
npm run package --prefix "./packages/reva-website"
