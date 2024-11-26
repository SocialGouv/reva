#!/usr/bin/env bash

archive_name="backup.tar.gz"

# Install the Scalingo CLI tool in the container:
install-scalingo-cli

# Install additional tools to interact with the database:
dbclient-fetcher "postgresql"

# Login to Scalingo, using the token stored in `DUPLICATE_API_TOKEN`:
scalingo login --api-token "${DUPLICATE_API_TOKEN}"

# Retrieve the addon id:
addon_id="$( scalingo --app "${DUPLICATE_SOURCE_APP}" --region osc-secnum-fr1 addons \
             | grep "postgresql" \
             | cut -d "|" -f 3 \
             | tr -d " " )"

# Download the latest backup available for the specified addon:
scalingo --app "${DUPLICATE_SOURCE_APP}" --region osc-secnum-fr1 --addon "${addon_id}" \
    backups-download --output "${archive_name}"

# Get the name of the backup file:
backup_file_name="$( tar --list --file="${archive_name}" \
                     | tail -n 1 \
                     | cut -d "/" -f 2 )"

# Extract the archive containing the downloaded backup:
tar --extract --verbose --file="${archive_name}" --directory="/app/"

