#!/bin/bash

npm run build --workspaces --if-present
npm i --prefix "./packages/reva-website"
npm run package --stack-size=10000 --prefix "./packages/reva-website"
