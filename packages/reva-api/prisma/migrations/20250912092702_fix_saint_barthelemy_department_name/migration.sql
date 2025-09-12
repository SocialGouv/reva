-- Fix department name typo from "Saint-Barthélémy" to "Saint-Barthélemy"
UPDATE department SET label = 'Saint-Barthélemy' WHERE code = '977';