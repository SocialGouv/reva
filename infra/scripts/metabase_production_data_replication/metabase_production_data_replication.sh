#!/usr/bin/env bash

echo 'Running metabase production data replication script'

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

echo "Dropping public schema"
psql --dbname "${DATABASE_URL}" -c "DROP SCHEMA public CASCADE"

echo "Creating public schema"
psql --dbname "${DATABASE_URL}" -c "CREATE SCHEMA public"



# Restore the data:
echo "Importing dump"
pg_restore --clean --if-exists --no-owner --no-privileges --no-comments \
--dbname "${DATABASE_URL}" "/app/${backup_file_name}"

echo "Running post import sql scripts"
psql --dbname "${DATABASE_URL}" -a -f post_dump_restore_scripts/create_metabase_specific_tables.sql

echo 'Metabase production data replication script finished'