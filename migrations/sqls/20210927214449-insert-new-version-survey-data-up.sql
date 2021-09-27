UPDATE surveys SET latest = false WHERE latest is true;

INSERT INTO surveys(id, questions, latest)
VALUES (uuid_generate_v4(), '[ { "id": "c44a75de-8324-44d4-9a00-8113f7c2702b", "label": "J''ai exercé un métier en lien avec le diplôme", "order": 1, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Oui j''en ai même exercé plusieurs en lien avec le diplôme", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Oui j''ai exercé une fois ce métier pendant assez longtemps", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Oui j''ai exercé ce métier une fois mais pendant peu de temps", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Les métiers que j''ai exercés ont un peu de rapport avec le diplôme", "order": 4 }, { "id": "f9c035ad-339e-4461-91e2-1b58121bd409", "label": "Non , les métiers que j''ai exercés n''ont pas de rapport avec le diplôme que je vise", "order": 5 } ], "isActive": true, "description": "Exemple : j''ai exercé le métier de Boulanger, je peux donc prétendre à la certification \"Boulanger\"", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet de savoir qu''il existe bien une relation entre votre ou vos métiers et le diplôme ciblé", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "a28ae07c-e3fd-4722-b399-e526cbb44a5a", "label": "J''ai exercé ce(s) métier(s) pendant :", "order": 2, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Moins d''un an", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Un an", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Plus d''un an", "order": 3 } ], "isActive": true, "description": "Les pratiques et les savoir-faire sont aussi valorisables", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet de quantifier vos expériences, vos pratiques et vos savoir-faire", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "74051568-3cd0-41bd-890d-c6f920f02b03", "label": "Pour obtenir ma certification, je suis prêt.e à déplacer des montagnes", "order": 3, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Oui, je suis vraiment déterminé ", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Je suis motivé", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Oui mais j''ai aussi d''autres choses à gérer", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Je ferai uniquement ce qu''il faut", "order": 4 }, { "id": "f9c035ad-339e-4461-91e2-1b58121bd409", "label": "Pas vraiment", "order": 5 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet de mesurer ma motivation à obtenir mon diplôme", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "140da6ae-c8c8-4f70-b45c-84886d6ff1da", "label": "J''ai choisi le bon diplôme", "order": 4, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Je suis sûr.e de mon choix", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Je suis à peu près sûr de mon choix", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Je ne suis pas vraiment sûr de mon choix", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Je ne suis pas du tout sûr de mon choix", "order": 4 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet de vérifier la certitude de mon choix de diplôme", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "7955dc5a-e36e-47d0-81c9-5ee73911c616", "label": "Je vais obtenir mon diplôme", "order": 5, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "J''ai confiance en moi, j''y crois vraiment", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "J''ai une bonne expérience, j''y crois", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "J''ai des doutes, je n''y crois pas vraiment", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Je ne suis pas sûr que mon expérience soit suffisante", "order": 4 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet de mesurer ma confiance en mon obtention du diplôme", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "794514a7-7152-4eca-ae8f-b50f53b3b027", "label": "Je suis disponible dans les 3 prochains mois", "order": 6, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Je peux me libérer moins de 2h/semaine", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Je peux me libérer environ 2h /semaine", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Je peux me libérer entre 2 et 5h /semaine", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Je peux me libérer + de 5h/semaine", "order": 4 } ], "isActive": true, "description": "On constate généralement qu''il faut accorder 5 heures par semaine pour une VAE", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet d''estimer votre disponibilité pour votre démarche VAE", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "a8d19e4c-473f-457c-ace2-4edf08822e18", "label": "Je suis à l''aise avec les outils numériques", "order": 7, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Je me débrouille très bien en général", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Je finis toujours par m''en sortir", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Si on me fait voir, je m''en sors bien ensuite", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Non, ce n''est vraiment pas mon truc", "order": 4 } ], "isActive": true, "description": "Internet, mobile, ordinateur, etc", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet d''évaluer votre aisance avec les outils numériques", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "2db2aba0-9810-4cc3-a7f2-d08c44b641d0", "label": "Je veux avoir mon diplôme pour", "order": 8, "answers": [ { "id": "b8649da4-8582-41ac-9e2b-7171602b50b0", "label": "Retrouver un emploi", "order": 1 }, { "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d", "label": "Être fier de moi", "order": 2 }, { "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6", "label": "Changer de métier", "order": 3 }, { "id": "f1ec8066-b340-4a19-8213-3aaa53a79203", "label": "Avoir un meilleur poste dans mon entreprise", "order": 4 }, { "id": "f9c035ad-339e-4461-91e2-1b58121bd409", "label": "Qu''on reconnaisse mes compétences", "order": 5 }, { "id": "4ab673a2-d45e-41a6-84cd-3eebba17cd3a", "label": "Créer mon entreprise", "order": 6 }, { "id": "6cebc878-f9b2-4895-9275-88a1f24e3805", "label": "Gagner plus d''argent", "order": 7 }, { "id": "0ddd58a8-dd93-4a12-ba97-022145ffbc5c", "label": "Entrer en formation ensuite", "order": 8 } ], "isActive": true, "description": "Internet, mobile, ordinateur, etc", "satisfactionQuestion": { "id": "acc92d5c-7921-412e-aa9b-d239f6950976", "label": "Selon vous, la question ci-dessus permet d''estimer votre motivation au regard de la relative importance de votre objectif ?", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "83434480-8bb1-474f-bda8-f9d1fac6c41a", "label": "Pour moi, avoir un diplôme, ça veut dire :", "order": 9, "answers": [ { "id": "8db15afd-16da-4c7b-adda-f3f65fb9395d", "label": "Que j''ai + de chance d''avoir un emploi", "order": 1 }, { "id": "e76d1726-6744-4fb2-b63b-52bc26711248", "label": "Que j''ai des compétences reconnues", "order": 2 }, { "id": "328126be-7d6b-459b-b95c-5ed57b3ac17f", "label": "Que j''aurai un meilleur salaire", "order": 3 }, { "id": "28211075-fad7-46f9-97d9-2f1494cd8790", "label": "Que j''aurai un poste de niveau supérieur", "order": 4 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "1768a966-9299-48cf-90e9-97582e6e9e48", "label": "Selon vous, la question ci-dessus permet d''évaluer la signification de l''obtention de votre diplôme", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "7cef9f3e-70dc-40d7-8975-01a0e98d4c50", "label": "Pour moi, avoir un emploi, c''est :", "order": 10, "answers": [ { "id": "44393d33-2e6d-4841-a2b7-c82554bc0014", "label": "Une obligation pour avoir un revenu", "order": 1 }, { "id": "0f4b9f41-1316-4d2b-af6d-c15414a462b8", "label": "Un moyen de m''épanouir ", "order": 2 }, { "id": "13f38b8d-c4c0-4552-9455-9e6d84d8c08a", "label": "Un moyen d''être reconnu", "order": 3 }, { "id": "5c850581-d227-49ba-8c2e-b72d59f2acb5", "label": "Avoir une occupation", "order": 4 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "789493a8-38e7-49df-aa35-3b0b36d1a944", "label": "Selon vous, la question ci-dessus permet d''évaluer la signification de l''obtention de votre emploi", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } }, { "id": "38c1b124-524c-4e18-8ed7-5414d62df161", "label": "Participer à cette démarche VAE pour avoir mon diplôme :", "order": 11, "answers": [ { "id": "56267fb9-b9ef-4fdb-9366-85b7891a5bf2", "label": "Ça me parait très difficile", "order": 1 }, { "id": "1a86a6c3-251e-4479-89b1-fd0e9ae807c5", "label": "Ça me parait difficile", "order": 2 }, { "id": "cf0cb911-627f-459b-8511-7190081082b4", "label": "Ça me parait facile", "order": 3 }, { "id": "20271d7d-98ea-4d9b-966e-50c6f327008d", "label": "Ça me parait très facile", "order": 4 } ], "isActive": true, "description": "", "satisfactionQuestion": { "id": "cd89f1b8-4317-4828-b57c-28580659a31c", "label": "Selon vous, la question ci-dessus permet d''évaluer la signification de l''obtention de votre emploi", "answers": [ { "id": "e476a9dd-1dc9-4aad-9b85-c7f61d7d2d6f", "label": "Complètement d''accord", "order": 1, "requireAdditionalInformation": false }, { "id": "afdb1768-64c3-4e31-9794-144ab0065da9", "label": "Plutôt d''accord", "order": 2, "requireAdditionalInformation": false }, { "id": "a105f773-0db1-4ce0-b170-16e84ffc8f63", "label": "Ni d''accord, ni pas d''accord", "order": 3, "requireAdditionalInformation": true }, { "id": "a45b08fa-6ab6-45d8-9114-8770e47550f0", "label": "Pas d''accord", "order": 4, "requireAdditionalInformation": true }, { "id": "59d5a30b-b388-425d-aa24-5be305ef26cd", "label": "Pas du tout d''accord", "order": 5, "requireAdditionalInformation": true } ] } } ]', true)
