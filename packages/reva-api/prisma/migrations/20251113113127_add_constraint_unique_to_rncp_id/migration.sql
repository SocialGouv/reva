WITH ordered AS (
  SELECT ctid,
         row_number() OVER (ORDER BY created_at, id) AS rn
  FROM "certification"
  WHERE "rncp_id" = '12296'
)
UPDATE "certification" c
SET "rncp_id" = CASE
  WHEN ordered.rn = 1 THEN '12296A'
  ELSE '12296B'
END
FROM ordered
WHERE c.ctid = ordered.ctid;

WITH ordered AS (
  SELECT ctid,
         row_number() OVER (ORDER BY created_at, id) AS rn
  FROM "certification"
  WHERE "rncp_id" = '12301'
)
UPDATE "certification" c
SET "rncp_id" = CASE
  WHEN ordered.rn = 1 THEN '12301A'
  ELSE '12301B'
END
FROM ordered
WHERE c.ctid = ordered.ctid;

CREATE UNIQUE INDEX "certification_rncp_id_key" ON "certification"("rncp_id");
