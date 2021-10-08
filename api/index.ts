import auth from './auth'
import candidate from './candidate'
import survey from './survey'

const bodyParser = require('body-parser')
const app = require('express')()

app.use(bodyParser.json())
app.use(auth)
app.use(candidate)
app.use(survey)

module.exports = app
