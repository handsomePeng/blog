module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/bill')
  })
  app.use('/signup', require('./signup'))
  app.use('/signin', require('./signin'))
  app.use('/signout', require('./signout'))
  app.use('/bill', require('./bill'))
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404')
    }
  })
}
