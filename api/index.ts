const bodyParser = require('body-parser')
const app = require('express')()

const questions = require('./survey')

app.use(bodyParser.json())
app.use(questions)

module.exports = app
