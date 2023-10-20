# How to configure bucket with Outscale Oject Storage

### Configure AWS CLI

https://docs.outscale.com/fr/userguide/Installer-et-configurer-AWS-CLI.html

### Create a bucket

https://docs.outscale.com/fr/userguide/Tutoriel-D%C3%A9marrer-avec-OOS-avec-AWS-CLI.html

_Important_: $YOUR_PROFILE and $OUTSCALE_REGION have to match. If you create Outscale Credentials in a region, you can create resources in the same region.

1. Create the bucket

```sh
$ aws s3api create-bucket \
    --profile $YOUR_PROFILE \
    --bucket $BUCKET_NAME \
    --acl private \
    --endpoint https://oos.$OUTSCALE_REGION.outscale.com
```

2. Check if the bucket exists

```sh
$ aws s3api list-buckets --profile $YOUR_PROFILE --endpoint https://oos.$OUTSCALE_REGION.outscale.com
```

You shoud see this in prompt

```sh
{
    "Buckets": [
        {
            "Name": "reva-staging",
            "CreationDate": "2023-10-16T13:53:41.909000+00:00"
        }
    ],
    "Owner": {
        "DisplayName": "718118014554",
        "ID": "5c7d62fe926434cd1931fa571185865537680e0061073d35239be8ad2c714799"
    }
}
```

### Available buckets

- **reva-staging**
- **reva-prod**

### Required Environnement Variables (without '$')

```sh
$OUTSCALE_ACCESS_KEY_ID
$OUTSCALE_SECRET_ACCESS_KEY
$OUTSCALE_BUCKET_NAME
$OUTSCALE_OBJECT_STORAGE_ENDPOINT
```
