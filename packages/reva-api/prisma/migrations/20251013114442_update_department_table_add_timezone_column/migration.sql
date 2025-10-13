-- AlterTable
ALTER TABLE "department"
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris';

ALTER TABLE "department"
ALTER COLUMN "timezone"
DROP DEFAULT;

UPDATE "department"
set
  timezone = 'Pacific/Noumea'
where
  code = '988';

UPDATE "department"
set
  timezone = 'Pacific/Tahiti'
where
  code = '987';

UPDATE "department"
set
  timezone = 'Pacific/Wallis'
where
  code = '986';

UPDATE "department"
set
  timezone = 'America/St_Barthelemy'
where
  code = '977';

UPDATE "department"
set
  timezone = 'Indian/Mayotte'
where
  code = '976';

UPDATE "department"
set
  timezone = 'America/Miquelon'
where
  code = '975';

UPDATE "department"
set
  timezone = 'Indian/Reunion'
where
  code = '974';

UPDATE "department"
set
  timezone = 'America/Cayenne'
where
  code = '973';

UPDATE "department"
set
  timezone = 'America/Martinique'
where
  code = '972';

UPDATE "department"
set
  timezone = 'America/Guadeloupe'
where
  code = '971';

UPDATE "department"
set
  timezone = 'America/Marigot'
where
  code = '97150';