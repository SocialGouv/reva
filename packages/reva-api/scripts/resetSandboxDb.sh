#!/usr/bin/env bash

# Check if DATABASE_URL starts with "reva_sandbo" AND ENVIRONEMENT equals "sandbox"
if [[ "$DATABASE_URL" == reva_sandbo* && "$ENVIRONEMENT" == "sandbox" ]]; then
    psql $DATABASE_URL < ./dump-reva_sandbox.sql
else
    echo "Not running in SANDBOX environment, exiting."
    exit 1
fi
