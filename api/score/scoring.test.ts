import { calculateScore, generateMeasuresAnswersMap } from "./scoring"
// @ts-ignore
import measures from "./measures.test.json"
// @ts-ignore
import measuresAnswers from "./measuresAnswers.test.json"



test('given a basic candidate answer to survey v2 with old format (answer is object WITHOUT answers property), when calculateScore is called, then it should return the good grades values', () => {

    const candidateAnswers = JSON.parse(`
  {
    "id": "1d66af99-5df5-462a-9972-5e2fc64def5c",
    "answers": {
      "140da6ae-c8c8-4f70-b45c-84886d6ff1da": {
        "answer": {
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je suis sûr.e de mon choix",
          "order": 1,
          "additionalInformation": null
        }
      },
      "2db2aba0-9810-4cc3-a7f2-d08c44b641d0": {
        "answer": {
          "id": "f9c035ad-339e-4461-91e2-1b58121bd409",
          "label": "Qu'on reconnaisse mes compétences",
          "order": 5,
          "additionalInformation": null
        }
      },
      "74051568-3cd0-41bd-890d-c6f920f02b03": {
        "answer": {
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "Je suis motivé.e",
          "order": 2,
          "additionalInformation": null
        }
      },
      "794514a7-7152-4eca-ae8f-b50f53b3b027": {
        "answer": {
          "id": "f1ec8066-b340-4a19-8213-3aaa53a79203",
          "label": "Je peux me libérer + de 5h/semaine",
          "order": 4,
          "additionalInformation": null
        }
      },
      "7955dc5a-e36e-47d0-81c9-5ee73911c616": {
        "answer": {
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "J'ai une bonne expérience, j'y crois",
          "order": 2,
          "additionalInformation": null
        }
      },
      "7cef9f3e-70dc-40d7-8975-01a0e98d4c50": {
        "answer": {
          "id": "44393d33-2e6d-4841-a2b7-c82554bc0014",
          "label": "Une obligation pour avoir un revenu",
          "order": 1,
          "additionalInformation": null
        }
      },
      "83434480-8bb1-474f-bda8-f9d1fac6c41a": {
        "answer": {
          "id": "e76d1726-6744-4fb2-b63b-52bc26711248",
          "label": "Que j'ai des compétences reconnues",
          "order": 2,
          "additionalInformation": null
        }
      },
      "a28ae07c-e3fd-4722-b399-e526cbb44a5a": {
        "answer": {
          "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6",
          "label": "Plus d'un an",
          "order": 3,
          "additionalInformation": null
        }
      },
      "a8d19e4c-473f-457c-ace2-4edf08822e18": {
        "answer": {
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je me débrouille très bien en général",
          "order": 1,
          "additionalInformation": null
        }
      },
      "c44a75de-8324-44d4-9a00-8113f7c2702b": {
        "answer": {
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Oui, j'en ai même exercé plusieurs en lien avec le diplôme",
          "order": 1,
          "additionalInformation": null
        }
      }
    },
    "created_at": "2021-09-20T20:09:57.460Z",
    "updated_at": "2021-09-20T20:09:57.460Z",
    "surveyId": "e3cb68a7-8751-4924-86ab-7f39ef1b27e0",
    "createdAt": "2021-09-20T20:09:57.460Z",
    "updatedAt": "2021-09-20T20:09:57.460Z"
}
`)

    /*
        details :
        ---------

        q1 : confiance 5
        q2 : confiance 3 , motivation 5
        q3 : motivation 4
        q4 : disponibilite 5
        q5 : confiance 4, experience 2
        q6 : motivation 5
        q7 : motivation 3
        q8 : experience 5
        q9 : aisance_numerique 5
        q10 : experience 5

        totaux
            obtainment - experience = 2 + 5 + 5 = 12 = 60 (max 65)
            profile - aisance_numerique = 5 = 5 = 5 (max 5)
            obtainment - disponibilite = 5 = 5 = 15 (,ax 15)
            profile - motivation_intrinseque = 5 + 4 + 5 +3 = 17 = 85 (max 125)
            profile - confiance = 5 +3 + 4 = 12 = 24 (max 36)

            obtainment = 60 + 15 = 75 / (65 + 15) = 0,9375
            profile = 5 + 85 + 24 = 114 / (5 + 125 + 36) = 0,686746988

            "experience"    5   0   13  15
            "aisance_numerique" 1   0   5   5
            "disponibilite" 3   0   5   5
            "motivation_intrinseque"    5   0   25  25
            "confiance" 2   0   18  18
    */

    const score = calculateScore(measures, generateMeasuresAnswersMap(measuresAnswers), candidateAnswers)
    expect(score.grades).toStrictEqual({
        obtainment: 0.9375,
        profile: 0.6867
    })
});


test('given a basic candidate answer to survey v2 with new format (answer is object WITH answers property), when calculateScore is called, then it should return the good grades values', () => {

    const candidateAnswers = JSON.parse(`
  {
    "id": "1d66af99-5df5-462a-9972-5e2fc64def5c",
    "answers": {
      "140da6ae-c8c8-4f70-b45c-84886d6ff1da": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je suis sûr.e de mon choix",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "2db2aba0-9810-4cc3-a7f2-d08c44b641d0": {
        "answer": {
            "answers": [{
          "id": "f9c035ad-339e-4461-91e2-1b58121bd409",
          "label": "Qu'on reconnaisse mes compétences",
          "order": 5,
          "additionalInformation": null
            }]
        }
      },
      "74051568-3cd0-41bd-890d-c6f920f02b03": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "Je suis motivé.e",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "794514a7-7152-4eca-ae8f-b50f53b3b027": {
        "answer": {
            "answers": [{
          "id": "f1ec8066-b340-4a19-8213-3aaa53a79203",
          "label": "Je peux me libérer + de 5h/semaine",
          "order": 4,
          "additionalInformation": null
            }]
        }
      },
      "7955dc5a-e36e-47d0-81c9-5ee73911c616": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "J'ai une bonne expérience, j'y crois",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "7cef9f3e-70dc-40d7-8975-01a0e98d4c50": {
        "answer": {
            "answers": [{
          "id": "44393d33-2e6d-4841-a2b7-c82554bc0014",
          "label": "Une obligation pour avoir un revenu",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "83434480-8bb1-474f-bda8-f9d1fac6c41a": {
        "answer": {
            "answers": [{
          "id": "e76d1726-6744-4fb2-b63b-52bc26711248",
          "label": "Que j'ai des compétences reconnues",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "a28ae07c-e3fd-4722-b399-e526cbb44a5a": {
        "answer": {
            "answers": [{
          "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6",
          "label": "Plus d'un an",
          "order": 3,
          "additionalInformation": null
            }]
        }
      },
      "a8d19e4c-473f-457c-ace2-4edf08822e18": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je me débrouille très bien en général",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "c44a75de-8324-44d4-9a00-8113f7c2702b": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Oui, j'en ai même exercé plusieurs en lien avec le diplôme",
          "order": 1,
          "additionalInformation": null
            }]
        }
      }
    },
    "created_at": "2021-09-20T20:09:57.460Z",
    "updated_at": "2021-09-20T20:09:57.460Z",
    "surveyId": "e3cb68a7-8751-4924-86ab-7f39ef1b27e0",
    "createdAt": "2021-09-20T20:09:57.460Z",
    "updatedAt": "2021-09-20T20:09:57.460Z"
}
`)

    /*
        details :
        ---------

        q1 : confiance 5
        q2 : confiance 3 , motivation 5
        q3 : motivation 4
        q4 : disponibilite 5
        q5 : confiance 4, experience 2
        q6 : motivation 5
        q7 : motivation 3
        q8 : experience 5
        q9 : aisance_numerique 5
        q10 : experience 5

        totaux
            obtainment - experience = 2 + 5 + 5 = 12 = 60 (max 65)
            profile - aisance_numerique = 5 = 5 = 5 (max 5)
            obtainment - disponibilite = 5 = 5 = 15 (,ax 15)
            profile - motivation_intrinseque = 5 + 4 + 5 +3 = 17 = 85 (max 125)
            profile - confiance = 5 +3 + 4 = 12 = 24 (max 36)

            obtainment = 60 + 15 = 75 / (65 + 15) = 0,9375
            profile = 5 + 85 + 24 = 114 / (5 + 125 + 36) = 0,686746988

            "experience"    5   0   13  15
            "aisance_numerique" 1   0   5   5
            "disponibilite" 3   0   5   5
            "motivation_intrinseque"    5   0   25  25
            "confiance" 2   0   18  18
    */

    const score = calculateScore(measures, generateMeasuresAnswersMap(measuresAnswers), candidateAnswers)
    expect(score.grades).toStrictEqual({
        obtainment: 0.9375,
        profile: 0.6867
    })
});

test('given a candidate answer with 2 answers with the same score in a multiple answers question, when calculateScore is called, then it should return the good grades values', () => {

    const candidateAnswers = JSON.parse(`
  {
    "id": "1d66af99-5df5-462a-9972-5e2fc64def5c",
    "answers": {
      "140da6ae-c8c8-4f70-b45c-84886d6ff1da": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je suis sûr.e de mon choix",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "2db2aba0-9810-4cc3-a7f2-d08c44b641d0": {
        "answer": {
            "answers": [{
          "id": "f9c035ad-339e-4461-91e2-1b58121bd409",
          "label": "Qu'on reconnaisse mes compétences",
          "order": 5,
          "additionalInformation": null
            }, {
          "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6",
          "label": "Changer de métier",
          "order": 5,
          "additionalInformation": null
            }]
        }
      },
      "74051568-3cd0-41bd-890d-c6f920f02b03": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "Je suis motivé.e",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "794514a7-7152-4eca-ae8f-b50f53b3b027": {
        "answer": {
            "answers": [{
          "id": "f1ec8066-b340-4a19-8213-3aaa53a79203",
          "label": "Je peux me libérer + de 5h/semaine",
          "order": 4,
          "additionalInformation": null
            }]
        }
      },
      "7955dc5a-e36e-47d0-81c9-5ee73911c616": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "J'ai une bonne expérience, j'y crois",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "7cef9f3e-70dc-40d7-8975-01a0e98d4c50": {
        "answer": {
            "answers": [{
          "id": "44393d33-2e6d-4841-a2b7-c82554bc0014",
          "label": "Une obligation pour avoir un revenu",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "83434480-8bb1-474f-bda8-f9d1fac6c41a": {
        "answer": {
            "answers": [{
          "id": "e76d1726-6744-4fb2-b63b-52bc26711248",
          "label": "Que j'ai des compétences reconnues",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "a28ae07c-e3fd-4722-b399-e526cbb44a5a": {
        "answer": {
            "answers": [{
          "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6",
          "label": "Plus d'un an",
          "order": 3,
          "additionalInformation": null
            }]
        }
      },
      "a8d19e4c-473f-457c-ace2-4edf08822e18": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je me débrouille très bien en général",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "c44a75de-8324-44d4-9a00-8113f7c2702b": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Oui, j'en ai même exercé plusieurs en lien avec le diplôme",
          "order": 1,
          "additionalInformation": null
            }]
        }
      }
    },
    "created_at": "2021-09-20T20:09:57.460Z",
    "updated_at": "2021-09-20T20:09:57.460Z",
    "surveyId": "e3cb68a7-8751-4924-86ab-7f39ef1b27e0",
    "createdAt": "2021-09-20T20:09:57.460Z",
    "updatedAt": "2021-09-20T20:09:57.460Z"
}
`)

    /*
        details :
        ---------

        q1 : confiance 5
        q2 : confiance 3 , motivation 5
        q3 : motivation 4
        q4 : disponibilite 5
        q5 : confiance 4, experience 2
        q6 : motivation 5
        q7 : motivation 3
        q8 : experience 5
        q9 : aisance_numerique 5
        q10 : experience 5

        totaux
            obtainment - experience = 2 + 5 + 5 = 12 = 60 (max 65)
            profile - aisance_numerique = 5 = 5 = 5 (max 5)
            obtainment - disponibilite = 5 = 5 = 15 (,ax 15)
            profile - motivation_intrinseque = 5 + 4 + 5 +3 = 17 = 85 (max 125)
            profile - confiance = 5 +3 + 4 = 12 = 24 (max 36)

            obtainment = 60 + 15 = 75 / (65 + 15) = 0,9375
            profile = 5 + 85 + 24 = 114 / (5 + 125 + 36) = 0,686746988

            "experience"    5   0   13  15
            "aisance_numerique" 1   0   5   5
            "disponibilite" 3   0   5   5
            "motivation_intrinseque"    5   0   25  25
            "confiance" 2   0   18  18
    */

    const score = calculateScore(measures, generateMeasuresAnswersMap(measuresAnswers), candidateAnswers)
    expect(score.grades).toStrictEqual({
        obtainment: 0.9375,
        profile: 0.6867
    })
});


test('given a candidate answer with 2 answers with different score in a multiple answers question, when calculateScore is called, then it should return the good grades values', () => {

    const candidateAnswers = JSON.parse(`
  {
    "id": "1d66af99-5df5-462a-9972-5e2fc64def5c",
    "answers": {
      "140da6ae-c8c8-4f70-b45c-84886d6ff1da": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je suis sûr.e de mon choix",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "2db2aba0-9810-4cc3-a7f2-d08c44b641d0": {
        "answer": {
            "answers": [{
          "id": "f9c035ad-339e-4461-91e2-1b58121bd409",
          "label": "Qu'on reconnaisse mes compétences",
          "order": 5,
          "additionalInformation": null
            }]
        }
      },
      "74051568-3cd0-41bd-890d-c6f920f02b03": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "Je suis motivé.e",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "794514a7-7152-4eca-ae8f-b50f53b3b027": {
        "answer": {
            "answers": [{
          "id": "f1ec8066-b340-4a19-8213-3aaa53a79203",
          "label": "Je peux me libérer + de 5h/semaine",
          "order": 4,
          "additionalInformation": null
            }]
        }
      },
      "7955dc5a-e36e-47d0-81c9-5ee73911c616": {
        "answer": {
            "answers": [{
          "id": "43b6807f-47dc-463f-8f64-3c23ddf70d1d",
          "label": "J'ai une bonne expérience, j'y crois",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "7cef9f3e-70dc-40d7-8975-01a0e98d4c50": {
        "answer": {
            "answers": [{
          "id": "44393d33-2e6d-4841-a2b7-c82554bc0014",
          "label": "Une obligation pour avoir un revenu",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "83434480-8bb1-474f-bda8-f9d1fac6c41a": {
        "answer": {
            "answers": [{
          "id": "e76d1726-6744-4fb2-b63b-52bc26711248",
          "label": "Que j'ai des compétences reconnues",
          "order": 2,
          "additionalInformation": null
            },{
          "id": "8db15afd-16da-4c7b-adda-f3f65fb9395d",
          "label": "Que j'ai plus de chance d'avoir un emploi",
          "order": 2,
          "additionalInformation": null
            }]
        }
      },
      "a28ae07c-e3fd-4722-b399-e526cbb44a5a": {
        "answer": {
            "answers": [{
          "id": "001c9384-b933-48d9-8e2d-c9e4dcc1a8a6",
          "label": "Plus d'un an",
          "order": 3,
          "additionalInformation": null
            }]
        }
      },
      "a8d19e4c-473f-457c-ace2-4edf08822e18": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Je me débrouille très bien en général",
          "order": 1,
          "additionalInformation": null
            }]
        }
      },
      "c44a75de-8324-44d4-9a00-8113f7c2702b": {
        "answer": {
            "answers": [{
          "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
          "label": "Oui, j'en ai même exercé plusieurs en lien avec le diplôme",
          "order": 1,
          "additionalInformation": null
            }]
        }
      }
    },
    "created_at": "2021-09-20T20:09:57.460Z",
    "updated_at": "2021-09-20T20:09:57.460Z",
    "surveyId": "e3cb68a7-8751-4924-86ab-7f39ef1b27e0",
    "createdAt": "2021-09-20T20:09:57.460Z",
    "updatedAt": "2021-09-20T20:09:57.460Z"
}
`)

    /*
        details :
        ---------

        q1 : confiance 5
        q2 : confiance 3 , motivation 5
        q3 : motivation 4
        q4 : disponibilite 5
        q5 : confiance 4, experience 2
        q6 : motivation 5
        q7 : motivation (3 + 5) / 2 = 4
        q8 : experience 5
        q9 : aisance_numerique 5
        q10 : experience 5

        totaux
            obtainment - experience = 2 + 5 + 5 = 12 = 60 (max 65)
            profile - aisance_numerique = 5 = 5 = 5 (max 5)
            obtainment - disponibilite = 5 = 5 = 15 (,ax 15)
            profile - motivation_intrinseque = 5 + 4 + 5  + 4 = 18 = 90 (max 125)
            profile - confiance = 5 +3 + 4 = 12 = 24 (max 36)

            obtainment = 60 + 15 = 75 / (65 + 15) = 0,9375
            profile = 5 + 90 + 24 = 119 / (5 + 125 + 36) = 0,7168674699

            "experience"    5   0   13  15
            "aisance_numerique" 1   0   5   5
            "disponibilite" 3   0   5   5
            "motivation_intrinseque"    5   0   25  25
            "confiance" 2   0   18  18
    */

    const score = calculateScore(measures, generateMeasuresAnswersMap(measuresAnswers), candidateAnswers)
    expect(score.grades).toStrictEqual({
        obtainment: 0.9375,
        profile: 0.7169
    })
});
