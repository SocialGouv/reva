const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

exports.updateAnswersScoreFromCsvFile = function (db, fileName) {
  return new Promise((resolve) => {
    const query = `
        UPDATE measures_answers
        SET score = ?
        FROM surveys, measures
        WHERE surveys.id = measures_answers.survey_id
        AND surveys.latest = true
        AND measures_answers.measure_id = measures.id
        AND measures.label = ?
        AND measures_answers.question_id = ?
        AND measures_answers.answer_id = ?
        ;
        `;
    const answersScores = [];
    const params = [];
    fs.createReadStream(path.join(__dirname, '..', 'csv', fileName), 'utf-8')
      .pipe(csv())
      .on('data', (data) => answersScores.push(data))
      .on('end', () => {
        // console.log(answersScores[0]);
        console.log('length', answersScores.length);
        const queriesPromise = answersScores.map(function (answerScore) {
          //
          return { query, params: [answerScore.score === '' ? null : parseInt(answerScore.score, 10), answerScore.measure_label, answerScore.question_id, answerScore.answer_id] };
        }).reduce(function (promise, result) {
          return promise.then(function () {
            console.log(result.query, result.params)
            return db.runSql(result.query, result.params)
          });
        }, Promise.resolve())
        resolve(queriesPromise)
      });

  });
};