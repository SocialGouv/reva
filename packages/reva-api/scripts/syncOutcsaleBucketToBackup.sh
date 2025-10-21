#!/bin/bash

set -e

echo "=========================================="
echo "Outscale Bucket Backup Sync Script"
echo "Date: $(date)"
echo "=========================================="

if [ -z "$OUTSCALE_ACCESS_KEY_ID" ]; then
    echo "Error: OUTSCALE_ACCESS_KEY_ID is not set"
    exit 1
fi

if [ -z "$OUTSCALE_SECRET_ACCESS_KEY" ]; then
    echo "Error: OUTSCALE_SECRET_ACCESS_KEY is not set"
    exit 1
fi

if [ -z "$OUTSCALE_BUCKET_NAME" ]; then
    echo "Error: OUTSCALE_BUCKET_NAME is not set"
    exit 1
fi

if [ -z "$OUTSCALE_BACKUP_BUCKET_NAME" ]; then
    echo "Error: OUTSCALE_BACKUP_BUCKET_NAME is not set"
    exit 1
fi

if [ -z "$OUTSCALE_BUCKET_REGION" ]; then
    echo "Error: OUTSCALE_BUCKET_REGION is not set"
    exit 1
fi

if [ -z "$OUTSCALE_OBJECT_STORAGE_ENDPOINT" ]; then
    echo "Error: OUTSCALE_OBJECT_STORAGE_ENDPOINT is not set"
    exit 1
fi

echo "Source bucket: $OUTSCALE_BUCKET_NAME"
echo "Backup bucket: $OUTSCALE_BACKUP_BUCKET_NAME"
echo "Region: $OUTSCALE_BUCKET_REGION"
echo "Endpoint: $OUTSCALE_OBJECT_STORAGE_ENDPOINT"
echo "=========================================="

if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing..."

    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    ./aws/install --install-dir /usr/local/aws-cli --bin-dir /usr/local/bin
    rm -rf aws awscliv2.zip

    echo "AWS CLI installed successfully"
fi

echo "AWS CLI version: $(aws --version)"

echo "Configuring AWS profile for Outscale..."
aws configure set aws_access_key_id "$OUTSCALE_ACCESS_KEY_ID" --profile outscale
aws configure set aws_secret_access_key "$OUTSCALE_SECRET_ACCESS_KEY" --profile outscale
aws configure set region "$OUTSCALE_BUCKET_REGION" --profile outscale

echo "Profile configured successfully"
echo "=========================================="

echo "Verifying connection to Outscale..."
if aws s3api list-buckets --profile outscale --endpoint "$OUTSCALE_OBJECT_STORAGE_ENDPOINT" &> /dev/null; then
    echo "Connection successful"
else
    echo "Error: Failed to connect to Outscale"
    exit 1
fi

echo "=========================================="

echo "Counting files to synchronize..."
SYNC_OUTPUT=$(aws s3 sync "s3://$OUTSCALE_BUCKET_NAME/" "s3://$OUTSCALE_BACKUP_BUCKET_NAME/" \
    --profile outscale \
    --endpoint "$OUTSCALE_OBJECT_STORAGE_ENDPOINT" \
    --delete \
    --dryrun 2>&1)

FILE_COUNT=$(echo "$SYNC_OUTPUT" | grep -c "copy\|delete" || echo "0")
echo "Files to synchronize: $FILE_COUNT"

echo "=========================================="
echo "Starting synchronization..."

aws s3 sync "s3://$OUTSCALE_BUCKET_NAME/" "s3://$OUTSCALE_BACKUP_BUCKET_NAME/" \
    --profile outscale \
    --endpoint "$OUTSCALE_OBJECT_STORAGE_ENDPOINT" \
    --delete \
    --quiet

echo "=========================================="
echo "Backup completed successfully!"
echo "Date: $(date)"
echo "Files synchronized: $FILE_COUNT"
echo "=========================================="
echo "Backup script finished"

