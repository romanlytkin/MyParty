var passport = require('passport');
var controllers = require('../controllers/basecontroller.js');

module.exports = function (app) {

    app.get('/auth', function (req, res) {

        if (req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        res.render('index', {
            user: req.user
        });
    });

    app.get('/sign-out', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/vk',
        passport.authenticate('vk', {
            scope: ['email']
        }),
        function (req, res) {
            // The request will be redirected to vk.com for authentication, so
            // this function will not be called.
        });

    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/'
        }),
        controllers.authcallback
        );
};
