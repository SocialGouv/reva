import { getCandidateAnswers, getMeasures, getMeasuresAnswers } from "./data"
import { calculateScore } from "./scoring"

const scoreRouter = require('express').Router()


scoreRouter.get(
    '/scores',
    async (_req: any, res: any) => {


        const measures = await getMeasures()
        const measuresAnswers = await getMeasuresAnswers()
        const candidateAnswers = await getCandidateAnswers()

        const measuresMap = new Map(measuresAnswers.map((m: any) => ([`${m.measureId}-${m.surveyId}-${m.questionId}-${m.answerId}`, m.score]))) as Map<string, number>
        // console.log(measuresMap)
        const grades = calculateScore(measures, measuresMap, candidateAnswers)
        return res.json(grades)
    }
)

export default scoreRouter
