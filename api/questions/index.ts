const router = require('express').Router()

router.get('/questions', (_req: any, res: any) => {
  res.json([
    {
      id: '132123123123',
      label: 'question 1',
      order: 1,
      answers: [
        {
          id: '234sdf2345wdf235',
          label: 'answer 1',
          order: 1,
        },
        {
          id: '36sdge56dgf45',
          label: 'answer 2',
          order: 2,
        },
      ],
      survey: {
        label: 'survey question ?',
        answers: [
          {
            id: 's234sdf2345wdf235',
            label: 'answer 1',
            order: 1,
          },
          {
            id: 's36sdge56dgf45',
            label: 'answer 2',
            order: 2,
          },
        ],
      },
    },
    {
      id: '2323232323',
      label: 'question 2',
      order: 1,
      answers: [
        {
          id: '234sdf2345wdf235',
          label: 'answer 1',
          order: 1,
        },
        {
          id: '36sdge56dgf45',
          label: 'answer 2',
          order: 2,
        },
      ],
      survey: {
        label: 'survey question ?',
        answers: [
          {
            id: 's234sdf2345wdf235',
            label: 'answer 1',
            order: 1,
          },
          {
            id: 's36sdge56dgf45',
            label: 'answer 2',
            order: 2,
          },
        ],
      },
    },
  ])
})

module.exports = router
