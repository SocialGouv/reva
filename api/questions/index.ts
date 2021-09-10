const router = require('express').Router()

router.get('/questions', (_req: any, res: any) => {
  res.json([
    {
      id: '132123123123',
      label: `J'ai exercé un métier en lien avec le diplôme`,
      description: `Exemple : j'ai exercé le métier de Boulanger, je peux donc prétendre à la certification "Boulanger"`,
      order: 1,
      isActive: true,
      answers: [
        {
          id: '234sdf2345wdf235',
          label: 'Oui, plusieurs',
          description: `J'ai exercé plusieurs métiers fortement liés au diplôme`,
          order: 1,
        },
        {
          id: '36s2dge56dgf45',
          label: 'Oui, un métier pendant longtemps',
          description: `J'ai exercé plusieurs métiers fortement liés au diplôme`,
          order: 2,
        },
        {
          id: '36s6dge56dgf45',
          label: 'Oui, un métier et peu de temps',
          description: `J'ai exercé un métier en lien avec le diplôme peu de temps mais suffisamment pour valider mes compétences`,
          order: 3,
        },
        {
          id: '36s6dge57dgf45',
          label: 'Pas complètement',
          description: `J'ai exercé un métier en partie ou similaire au diplôme`,
          order: 4,
        },
        {
          id: '36s6tge57dgf45',
          label: 'Non',
          description: `Je n'ai pas du tout exercé de métier en lien avec le diplôme`,
          order: 5,
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
      label: `J'ai des expériences professionnelles à valoriser`,
      description: `Les pratiques et les savoir-faire sont aussi valorisables`,
      order: 2,
      answers: [
        {
          id: '2234sdtf2345wdf235',
          label: `Complètement d'accord`,
          order: 1,
        },
        {
          id: '236sdgye56dgf45',
          label: `Plutôt d'accord`,
          order: 2,
        },
        {
          id: '236sdgye5wdef45',
          label: `Ni d'accord, ni pas d'accord`,
          order: 3,
        },
        {
          id: '236qdgye5zdef45',
          label: `Pas d'accord`,
          order: 4,
        },
        {
          id: '236qdgyeszdef45',
          label: `Pas du tout d'accord`,
          order: 5,
        },
      ],
      survey: {
        label: 'survey question ?',
        answers: [
          {
            id: '2s234sdf2345wdf235',
            label: 'answer 1',
            order: 1,
          },
          {
            id: '2s36sdge56dgf45',
            label: 'answer 2',
            order: 2,
          },
        ],
      },
    },
  ])
})

module.exports = router
