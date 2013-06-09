module.exports = function (app) {

  var application = require('../app/controllers/application');
  app.get('/', application.index);
}