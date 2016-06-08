var config = require("nconf");

var nodemailer = require("nodemailer");
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.get("mailer:auth:user"),
        pass: config.get("mailer:auth:pass")
    }
});
//---------------------------------------

var mysql = require('mysql-model');
//connect db
var connection = mysql.createConnection({
    host     : config.get("dbconnection:host"),
    user     : config.get("dbconnection:user"),
    password : config.get("dbconnection:password"),
    database : config.get("dbconnection:database")
});

var Friends = connection.extend({
    tableName: "friends",
});

friends = new Friends();

module.exports = {
    authcallback:function (req, res) {
        if (req.user.id == req.user.adminid) {
            res.redirect('/admin');
        }
        else {
          friends.find('first', {where: "vk_id = " + req.user.id}, function(err, rows, fields) {
                if (!rows) {
                  res.redirect('/add');
                }
                else {
                  res.json(rows);
                  res.redirect('/edit');
                }
          });
        }
    },

    admin:function (req, res) {
        if (req.isAuthenticated()) {
            if (req.user.id == req.user.adminid) {
                friends.find('all', function(err, rows, fields) {
                    res.render('index', {
                        user: req.user,
                        friends: rows,
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
    },

    addget:function (req, res) {
        if (req.isAuthenticated()) {
            friends.find('first', {where: "vk_id = " + req.user.id}, function(err, rows, fields) {
                if (!rows) {
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
    },

    addpost:function (req, res) {
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
        newfriend = new Friends({
            vk_id: req.user.id,
            name: req.user.username,
            photo: req.user.photoUrl,
            go_to_party: req.body.goparty,
            beverages: req.body.beverages
        });
        // Will create new record
        newfriend.save();

        var mailOptions = {
            from: "MyParty ✔ <"+config.get("mailer:auth:user")+">", // sender address
            to: ""+config.get("adminemail"), // list of receivers
            subject: "User go to party ✔", // Subject line
            text: "User go to party ✔", // plaintext body
            html: "<h3>Ваш друг сделал свой выбор ✔</h3>" +
                  "<div>Друг " + req.user.username + " " + req.user.profileUrl + " " +
                   "желает пойти не вечеринку и будет пить " + req.body.beverages + "</div>"
        }

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
        res.redirect('/edit');
      }
    },

    editget:function (req, res) {
        if (req.isAuthenticated()) {
            friends.find('first', {where: "vk_id = " + req.user.id}, function(err, rows, fields) {
                if (!rows) {
                    res.redirect('/add');
                }
                else {
                  res.render('edit', {
                      user: req.user,
                      userdata: rows
                  });
                }
            });
        }
        else {
            res.redirect('/');
        }
    },

    editpost:function (req, res) {
        friends.remove('vk_id=' + req.user.id);

        var mailOptions = {
            from: "MyParty ✔ <"+config.get("mailer:auth:user")+">", // sender address
            to: ""+config.get("adminemail"), // list of receivers
            subject: "User delete his choice ✔", // Subject line
            text: "User delete his choice ✔", // plaintext body
            html: "<h3>Ваш друг хочет изменить свое решение ✔</h3>" +
                  "<div>Друг " + req.user.username + " " + req.user.profileUrl + " " +
                   "удалил свою заявку и возможно желает изменить свое решение </div>"
        }

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
        res.redirect('/add');
    },
};
