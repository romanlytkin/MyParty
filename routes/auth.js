var passport = require('passport');
var config = require("nconf");
var email   = require("emailjs/email");
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : config.get("dbconnection:host"),
  user     : config.get("dbconnection:user"),
  password : config.get("dbconnection:password"),
  database : config.get("dbconnection:database")
});

connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ...");
    } else {
        console.log("Error connecting database ..." + err);
    }
});

var server  = email.server.connect({
   user:    config.get("mailer:auth:user"),
   password:config.get("mailer:auth:pass"),
   host:    "smtp.gmail.com",
   ssl:     true
});

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
        function (req, res) {
            if (req.user.id == req.user.adminid) {
                res.redirect('/admin');
            }
            else {
              var sql = 'SELECT * FROM friends WHERE vk_id = ' + req.user.id;
              getdata(sql, function(userdata){
                console.log("userdata is " + userdata);
                if (userdata.length == 0) {
                  res.redirect('/add');
                }
                else {
                  res.json(userdata);
                  res.redirect('/edit');
                }
              });
            }
        });

    app.get('/admin', function (req, res) {
        if (req.isAuthenticated()) {
            if (req.user.id == req.user.adminid) {
                var sql = 'SELECT * FROM friends';
                getdata(sql, function(userdata){
                    res.render('index', {
                        user: req.user,
                        friends: userdata,
                        email: config.get("adminemail")
                    });
                });
            }
            else {
              res.redirect('/edit');
            }
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/add', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = 'SELECT * FROM friends WHERE vk_id = ' + req.user.id;
            getdata(sql, function(userdata){
                if (userdata.length == 0) {
                    res.render('add', {
                        error: '',
                        user: req.user
                    });
                }
                else {
                  res.redirect('/edit');
                }
            });
        }
        else {
            res.redirect('/');
        }
    });

    app.post('/add', function (req, res) {

          if (req.body.goparty == 0 && req.body.beverages == 0){
              res.render('add', {
                  error: 'Выбери желаемое',
                  user: req.user,
                  goparty: req.body.goparty,
                  beverages: req.body.beverages
              });
          }
          else if (req.body.goparty == 0 && req.body.beverages != 0){
              res.render('add', {
                  error: 'Вы не выбрали "Напитки"',
                  user: req.user,
                  goparty: req.body.goparty,
                  beverages: req.body.beverages
              });
          }
          else if (req.body.goparty != 0 && req.body.beverages == 0){
              res.render('add', {
                  error: 'Вы не выбрали "Иду/Не иду"',
                  user: req.user,
                  goparty: req.body.goparty,
                  beverages: req.body.beverages
              });
          }
          else {
              console.log(req.user.id+","+req.user.username+","+req.user.photoUrl+","+req.body.goparty+","+req.body.beverages);
              var sql = "INSERT INTO friends (vk_id, name, photo, go_to_party, beverages)" +
              "VALUES ("+req.user.id+",'"+req.user.username+"','"+req.user.photoUrl+"','"+req.body.goparty+"','"+req.body.beverages+"')";
              getdata(sql, function(userdata){
                  //send mail with defined transport object
                  server.send({
                     text:    "Друг " + req.user.username + " " + req.user.profileUrl + " " +
                              "желает пойти не вечеринку и будет пить " + req.body.beverages,
                     from:    config.get("mailer:auth:user"),
                     to:      config.get("adminemail"),
                     subject: "User go to party"
                  }, function(err, message) {
                    if(err){
                        console.log(err);
                    }else{
                        console.log('Message sent: ' + message);
                    };
                  });
                  res.redirect('/edit');
              });
          }
    });

    app.get('/edit', function (req, res) {
        if (req.isAuthenticated()) {
            var sql = 'SELECT * FROM friends WHERE vk_id = ' + req.user.id;
            getdata(sql, function(userdata){
                if (userdata.length == 0) {
                    res.redirect('/add');
                }
                else {
                  res.render('edit', {
                      user: req.user,
                      userdata: userdata[0]
                  });
                }
            });
        }
        else {
            res.redirect('/');
        }
    });

    app.post('/edit', function (req, res) {
      var sql = "DELETE FROM friends " + "WHERE vk_id=" + req.user.id;
      console.log(sql);
      getdata(sql, function(userdata){
          //send mail with defined transport object
          server.send({
             text:    "Друг " + req.user.username + " " + req.user.profileUrl + " " +
                      "передумал и решил не идти на вучеринку",
             from:    config.get("mailer:auth:user"),
             to:      config.get("adminemail"),
             subject: "User NOT go to party"
          }, function(err, message) {
            if(err){
                console.log(err);
            }else{
                console.log('Message sent: ' + message);
            };
          });
          res.redirect('/add');
      });
    });

};

function getdata(sql, callback) {
  var userdata = [];
  connection.query(sql, function(err, rows, fields) {
    if (!err) {
      userdata = rows;
      console.log('The solution is: ', rows);
      // connection.end();
      return callback(userdata);
    }
    else {
      console.log('Error while performing Query.');
    }
  });
};
