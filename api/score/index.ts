import { isAdminMiddleware } from "../auth"
import { getCandidateAnswers, getMeasures, getMeasuresAnswers, updateCandidateAnswersScore } from "./data"
import { calculateScore, generateMeasuresAnswersMap } from "./scoring"

const scoreRouter = require('express').Router()


scoreRouter.post(
    '/scores/calculate',
    isAdminMiddleware,
    async (_req: any, res: any) => {

        try {
            const measures = await getMeasures()
            const measuresAnswers = await getMeasuresAnswers()
            const candidateAnswers = await getCandidateAnswers()

            const measuresMap = generateMeasuresAnswersMap(measuresAnswers)

            const updatePromises = candidateAnswers
                .map((candidateAnswer: { id: string }) => {
                    const score = calculateScore(measures, measuresMap, candidateAnswer)
                    return { id: candidateAnswer.id, score }            
                })
                .map(updateCandidateAnswersScore)

            await Promise.all(updatePromises)

            return res.status(200).send()

        } catch (e) {
            console.log(e)
            res.status(500).send(e.message)
        }
    }
)

export default scoreRouter
