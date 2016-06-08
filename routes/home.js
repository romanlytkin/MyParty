var config = require("nconf");
var controllers = require('../controllers/basecontroller.js');

module.exports = function (app) {
    app.get('/', function (req, res) {
        if (req.isAuthenticated()) {
            if (req.user.id != req.user.adminid) {
                res.redirect('/edit');
            }
            else {
                res.redirect('/amin');
            }
        }
        res.render('layout', {
          user: req.user,
          email: config.get("adminemail")
        });
    });

    app.get('/admin', controllers.admin);

    app.get('/add', controllers.addget);

    app.post('/add', controllers.addpost);

    app.get('/edit', controllers.editget);

    app.post('/edit', controllers.editpost);
};
