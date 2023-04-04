#!/bin/bash

npm i --prefix "./packages/reva-website"
npm run package --stack-size=10000 --prefix "./packages/reva-website"
