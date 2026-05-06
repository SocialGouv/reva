DELETE FROM features
WHERE key IN (
  'batch.update-candidacies-inactif-en-attente',
  'batch.update-candidacies-inactif-confirme'
);
