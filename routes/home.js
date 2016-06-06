var config = require("nconf");

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
};
