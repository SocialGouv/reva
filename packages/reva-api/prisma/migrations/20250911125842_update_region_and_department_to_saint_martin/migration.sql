-- Update region label from "Sainte-Lucie / Saint-Martin" to "Saint-Martin"
UPDATE region SET label = 'Saint-Martin' WHERE code = '07';

-- Update department label from "Saint Barthélémy / Saint Martin" to "Saint-Martin"
UPDATE department SET label = 'Saint-Martin' WHERE code = '97150';
