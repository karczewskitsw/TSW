/**
 * Module dependencies.
 */

var express = require('express'),
  path = require('path'),
  root = path.normalize(__dirname + '/..')


module.exports = function (app) {

  // should be placed before express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.favicon());
  app.use(express.static(root + '/public'));

  // set views path, template engine and default layout
  app.set('views', root + '/app/views');
  app.set('view engine', 'ejs');

  app.configure(function () {
    // cookieParser should be above session
    app.use(express.cookieParser());

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // routes should be at the last
    app.use(app.router);
  })
}