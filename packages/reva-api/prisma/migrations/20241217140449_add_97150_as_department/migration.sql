INSERT INTO region (id, label, code, created_at)
VALUES ('525798fc-3926-4d85-9049-3dca5c11230e', 'Sainte-Lucie / Saint-Martin', '07', now())
ON CONFLICT (code)
DO NOTHING;

INSERT INTO department (id, label, code, region_id, created_at)
VALUES ('ef4dc302-b93f-4eff-9668-b264f08cd14a', 'Sainte-Lucie / Saint-Martin', '97150','525798fc-3926-4d85-9049-3dca5c11230e', now())
ON CONFLICT (code)
DO NOTHING;
