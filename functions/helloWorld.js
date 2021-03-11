const functions = require('firebase-functions')


exports.main = functions
  .region('europe-west2')
  .https.onCall((event, context) => {
    functions.logger.info(event, context)
    return {
      payload: 'hello!',
    }
  })
