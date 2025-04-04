INSERT INTO
    "public"."region" ("id", "label", "code")
VALUES
    (
        'ed2ce65d-2fc4-45cd-86b8-2c08cfb0d09a',
        'Saint-Pierre-et-Miquelon',
        '151'
    );

INSERT INTO
    "public"."department" (
        "id",
        "label",
        "code",
        "region_id",
        "elligible_vae"
    )
VALUES
    (
        'c90c40cc-83b7-405b-8d7e-b31012017a22',
        'Saint-Pierre-et-Miquelon',
        '975',
        'ed2ce65d-2fc4-45cd-86b8-2c08cfb0d09a',
        't'
    );