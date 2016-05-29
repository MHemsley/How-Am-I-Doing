'use strict'

exports.isQuestionnaireCompleted = function (Schema, quID) {
  return promisifyQuery(
    Schema,
    'Questionnaire',
    'findById',
    quID,
    (questionnaire) => questionnaire.completed
  )
}

exports.isQuestionnaireCreatedByUser = function (Schema, quID, uID) {
  return promisifyQuery(
    Schema,
    'Questionnaire',
    'find',
    { where: { id: quID, user_id: uID } },
    (questionnaire) => !questionnaire || questionnaire.length < 1
  )
}

exports.getCategoriesByQuestionnaire = function (Schema, quID) {
  return promisifyQuery(
    Schema,
    'QuestionnaireCategories',
    'find',
    { where: { questionnaire_id: quID } }
  )
}

exports.getQuestionsByCategories = function (Schema, catIDs) {
  return promisifyQuery(
    Schema,
    'Question',
    'find',
    { where: { cat_id: { in: catIDs } } }
  )
}

exports.getAnswersByQuestionnaire = function (Schema, quID) {
  return promisifyQuery(
    Schema,
    'QuestionnaireAnswers',
    'find',
    { where: { questionnaire_id: quID } }
  )
}

exports.getQuestionsByQuestionnaire = function (Schema, quID) {
  return (
    exports.getCategoriesByQuestionnaire(Schema, quID)
      .then((categories) => {
        return exports.getQuestionsByCategories(Schema, categories.map((cat) => cat.id))
      })
  )
}

exports.getQuestionsById = function (Schema, qIDs) {
  return promisifyQuery(
    Schema,
    'Question',
    'find',
    { where: { id: { in: qIDs } } }
  )
}

exports.upsertAnswersByQuestionnaire = function (Schema, quID, answers) {
  promisifyQuery(
    Schema,
    'Questionnaire',
    'findById',
    quID
  ).then((questionnaire) => {
    return Promise.all(
      answers.map((answer) => {
        return new Promise((resolve, reject) => {
          questionnaire.answer.updateOrCreate(
            { where: { question_id: answer.question_id } },
            answer,
            (err, result) => {
              return err || !result ? reject(err) : resolve(result)
            })
        })
      })
    )
  })
}

const promisifyQuery = exports.promisifyQuery = function (Schema, model, method, query, cb) {
  return new Promise((resolve, reject) => {
    Schema.models[model][method](query, (err, result) => {
      if (err || !result)
        return reject(err)

      return cb ? resolve(cb(result)) : resolve(result)
    })
  })
}

const promisifyAllQueries = exports.promisifyAllQueries = function (Schema, model, method, data) {
  return Promise.all(
    data.map((datum) => {
      return new Promise((resolve, reject) => {
        Schema.models[model][method](datum, (err, result) => {
          return err || !result ? reject(err) : resolve(result)
        })
      })
    })
  )
}
