#!/bin/bash

branch_name=$1
ENV_DIR=$(pwd)

if [ -z "$branch_name" ]; then
    echo "No branch specified."
    echo "Usage example: npm run deploy release/2023-12-24"
    exit 1
fi

if [ -f "${ENV_DIR}/.env" ]; then
    source "${ENV_DIR}/.env"
else
    echo "File .env not found in directory ${ENV_DIR}."
    exit 1
fi

echo "Do you wish to deploy '$branch_name' to $SCALINGO_DEFAULT_APPS? (y/n)"
read user_response

if [ "$user_response" = "n" ]; then
    echo "Which applications do you wish to deploy? Example: app1, app2, app3"
    read SCALINGO_DEFAULT_APPS
elif [ "$user_response" != "y" ]; then
    echo "Deployment cancelled."
    exit 1
fi

# Execute backups in parallel
echo "$SCALINGO_AUTH_DATABASE_OPTIONS" | xargs scalingo backups-create &
pid1=$!
echo "$SCALINGO_APP_DATABASE_OPTIONS" | xargs scalingo backups-create &
pid2=$!

# Wait for both backups
wait $pid1
code1=$?
wait $pid2
code2=$?

# Check that both backups completed successfully
if [ $code1 -ne 0 ] || [ $code2 -ne 0 ]; then
    echo "An error occurred while creating the backups."
    echo "Deployment cancelled."
    exit 1
fi

# Deploy to each app
IFS=','
for app in $SCALINGO_DEFAULT_APPS; do
    scalingo --app "${app// /}" --region "$SCALINGO_REGION" integration-link-manual-deploy "$branch_name"
done
unset IFS