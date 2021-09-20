const router = require('express').Router()
const yup = require('yup')
const data = require('./data')

router.get('/surveys/latest', async (_req: any, res: any) => {
  const survey = await data.getLatestSurvey()

  if (!survey) {
    return res.status(404).send()
  }

  res.json(survey)
})

router.post('/surveys/:id/candidates', async (req: any, res: any) => {
  const schema = yup.object().shape({
    surveyId: yup.string().required(),
    answers: yup.object().required(),
    candidate: yup
      .object()
      .required()
      .shape({
        email: yup.string().email().required(),
        firstname: yup.string().required(),
        lastname: yup.string().required(),
        diplome: yup.string().required(),
        phoneNumber: yup
          .string()
          .matches(/^[0-9]{10}$/, 'Numéro de téléphone invalide.'),
      }),
  })

  const isValid = await schema.isValid(req.body)

  if (!isValid) {
    res.status(500).send('Bad format')
  } else {
    await data.saveCandidateSurvey(req.body)
    res.status(200).send()
  }
})

module.exports = router
