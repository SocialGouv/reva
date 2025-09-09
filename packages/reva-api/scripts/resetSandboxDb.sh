#!/usr/bin/env bash

# Check if DATABASE_URL starts with "reva_sandbo" AND ENVIRONEMENT equals "sandbox"
if [[ "$DATABASE_URL" == postgres://reva_sandbo* && "$ENVIRONEMENT" == "sandbox" ]]; then

    if [[ -z "${RESET_DB_API_TOKEN:-}" || -z "${SANDBOX_SOURCE_APP:-}" || -z "${SANDBOX_DATABASE_ADDON_ID:-}" || -z "${SANDBOX_BACKUP_ID:-}" ]]; then
        echo "Error: One or more required environment variables are not defined." >&2
        exit 1
    fi

    echo 'Running interop DB reset script'

    archive_name="backup.tar.gz"

    # Install the Scalingo CLI tool in the container:
    install-scalingo-cli

    # Install additional tools to interact with the database:
    dbclient-fetcher "postgresql"

    # Login to Scalingo, using the token stored in `RESET_DB_API_TOKEN`:
    scalingo login --api-token "${RESET_DB_API_TOKEN}"

    # Retrieve the addon id:
    addon_id="${SANDBOX_DATABASE_ADDON_ID}"

    # Download the latest backup available for the specified addon:
    scalingo --app "${SANDBOX_SOURCE_APP}" --region osc-secnum-fr1 --addon "${addon_id}" \
        backups-download --backup $SANDBOX_BACKUP_ID --output "${archive_name}"

    # Get the name of the backup file:
    backup_file_name="$( tar --list --file="${archive_name}" \
                        | tail -n 1 \
                        | cut -d "/" -f 2 )"

    # Extract the archive containing the downloaded backup:
    tar --extract --verbose --file="${archive_name}" --directory="/app/"

    # Restore the data:
    echo "Importing dump"
    pg_restore --clean --if-exists --no-owner --no-privileges --no-comments \
    --dbname "${DATABASE_URL}" "/app/${backup_file_name}"

    echo 'Interop DB reset script finished'
else
    echo "Not running in SANDBOX environment, exiting."
    exit 1
fi
