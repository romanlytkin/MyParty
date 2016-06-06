var config = require("nconf");
var passport = require('passport');
var AuthVKStrategy = require('passport-vkontakte').Strategy;

passport.use('vk', new AuthVKStrategy({
        clientID: config.get("auth:vk:app_id"),
        clientSecret: config.get("auth:vk:secret"),
        callbackURL: config.get("app:url") + "/auth/vk/callback"
    },
    function (accessToken, refreshToken, profile, done) {

        // console.log("vk auth: ", profile);

        return done(null, {
            adminid: config.get("adminid"),
            id: profile.id,
            username: profile.displayName,
            photoUrl: profile.photos[0].value,
            profileUrl: profile.profileUrl
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});


passport.deserializeUser(function (data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

module.exports = function (app) {
};
