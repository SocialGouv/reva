import { calculateScore, generateMeasuresAnswersMap } from "./scoring"
// @ts-ignore
import measures from "./measures.test.json"
// @ts-ignore
import measuresAnswers from "./measuresAnswers.test.json"


const candidateAnswers = JSON.parse(`
  {
    "id": "1d66af99-5df5-462a-9972-5e2fc64def5c",
    "survey_id": "b2077263-1321-4982-8f88-5849772cf855",
    "answers": {
        "140da6ae-c8c8-4f70-b45c-84886d6ff1da": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Complètement d'accord",
                "order": 1,
                "additionalInformation": null
            }
        },
        "2db2aba0-9810-4cc3-a7f2-d08c44b641d0": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Retrouver du travail",
                "order": 1,
                "additionalInformation": null
            }
        },
        "74051568-3cd0-41bd-890d-c6f920f02b03": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Ça me correspond exactement",
                "order": 1,
                "additionalInformation": null
            }
        },
        "794514a7-7152-4eca-ae8f-b50f53b3b027": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Complètement d'accord",
                "order": 1,
                "additionalInformation": null
            }
        },
        "7955dc5a-e36e-47d0-81c9-5ee73911c616": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Complètement d'accord",
                "order": 1,
                "additionalInformation": null
            }
        },
        "a28ae07c-e3fd-4722-b399-e526cbb44a5a": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Complètement d'accord",
                "order": 1,
                "additionalInformation": null
            }
        },
        "a8d19e4c-473f-457c-ace2-4edf08822e18": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Complètement d'accord",
                "order": 1,
                "additionalInformation": null
            }
        },
        "c44a75de-8324-44d4-9a00-8113f7c2702b": {
            "answer": {
                "id": "b8649da4-8582-41ac-9e2b-7171602b50b0",
                "label": "Oui, plusieurs",
                "order": 1,
                "description": "J'ai exercé plusieurs métiers fortement liés au diplôme",
                "additionalInformation": null
            }
        }
    },
    "created_at": "2021-09-20T20:09:57.460Z",
    "updated_at": "2021-09-20T20:09:57.460Z",
    "surveyId": "b2077263-1321-4982-8f88-5849772cf855",
    "createdAt": "2021-09-20T20:09:57.460Z",
    "updatedAt": "2021-09-20T20:09:57.460Z"
}
`)

test('adds 1 + 2 to equal 3', () => {


  const score = calculateScore(measures, generateMeasuresAnswersMap(measuresAnswers), [candidateAnswers])
  expect(score).toBe(true)
});
