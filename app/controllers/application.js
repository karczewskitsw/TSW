/**
 * Home page
 */

exports.index = function (req, res) {
  res.render('index', {
    title: 'Witaj w Puzzle!'
  });
};