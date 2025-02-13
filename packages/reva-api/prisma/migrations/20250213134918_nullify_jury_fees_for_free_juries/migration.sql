-- This is an empty migration.
UPDATE certification SET jury_estimated_cost = NULL WHERE jury_estimated_cost = 0.00;