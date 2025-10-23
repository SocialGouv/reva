-- Update existing goal labels
UPDATE goal 
SET label = 'Confirmer ses acquis métier', updated_at = NOW()
WHERE label = 'Consolider mes acquis métier';

UPDATE goal 
SET label = 'Être reconnu dans sa profession', updated_at = NOW()
WHERE label = 'Être reconnu dans ma profession';

UPDATE goal 
SET label = 'Obtenir un meilleur salaire', updated_at = NOW()
WHERE label = 'Avoir un meilleur salaire';

UPDATE goal 
SET label = 'Se réorienter', updated_at = NOW()
WHERE label = 'Me réorienter';

-- Set is_active to false for specified goals
UPDATE goal 
SET is_active = false, updated_at = NOW()
WHERE label = 'Me redonner confiance en moi';

UPDATE goal 
SET is_active = false, updated_at = NOW()
WHERE label = 'Autre';

-- Insert new goals (assuming orders 8 and 9 for the new entries)
INSERT INTO goal (id, label, is_active, "order", created_at)
VALUES 
  (uuid_generate_v4(), 'Faire reconnaître officiellement ses compétences', true, 8, NOW()),
  (uuid_generate_v4(), 'Se maintenir ou évoluer dans son emploi', true, 9, NOW())
ON CONFLICT (label) DO NOTHING;