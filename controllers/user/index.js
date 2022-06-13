var express = require('express');
const user = express.Router();
const rateLimit  = require('express-rate-limit');
const find = require('../../functions/index');
const makeid = require('../../functions/number_gen');
const devModeCheck = require('../../functions/devmodecheck');
const config = require('../config');
const EmailSchema = require('../../models/login');
require('dotenv').config();

user.use(express.static(__dirname + '.../public'));

function is_logged_in(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send({ error: 'You are not logged in' });
    }
}

user.get('/', devModeCheck, function(req, res) {
    if (req.session.user) {
        res.render('dashboard.html')
    } else {
        res.render('login.html')
    }
});

user.get('/login', devModeCheck, function(req, res) {
    res.render('login.html')
});

user.post('/login', function(req, res) {
let email = req.body.email;
if (email) {
    EmailSchema.findOne({
        _id: email
    }, (err, user) => {
        if (err) {
            console.log(err)
        } else if (user) {
            if (user.password === req.body.password) {
                req.session.user = user
                res.redirect('/user')
            } else {
                res.redirect('/login')
            }
        } else {
            res.redirect('/login')
        }
    })
} else {
    res.redirect('/login')
}
});

user.get('/register', devModeCheck, function(req, res) {
    res.render('register.html')
});

user.post('/register', function(req, res) {
    let email = req.body.email;
    email = email.toLowerCase();
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let token = makeid(60);
    /// make email lowercase
    EmailSchema.findOne({
        _id: email
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error: ' + err);
        } else {
            if (user) {
                res.send('Email already exists');
            } else {
                if (password === confirmPassword) {
                    let newUser = new EmailSchema({
                        _id: email,
                        username: username,
                        password: password,
                        admin: false,
                        premium: false,
                        verified: false,
                    });
                    /// save token too
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        } else {
                            req.session.user = newUser;
                            let newToken = new tokenSchema({
                                _id: email,
                                token: token
                            })
                            newToken.save()
                            sender(email, 'Welcome to SynTech', `Welcome to SynTech!\n\nYou have successfully registered for SynTech.\n\nYou need to verify your account at http://${req.hostname}/verify/${token}\n\nThank you for using SynTech!`)
                            res.redirect('/dashboard');
                        }
                    });
                } else {
                    res.send('Passwords do not match');
                }
            }
        }
    })
}); 

user.get('/forget', devModeCheck, function(req, res) {
    res.render('forget.html')
});

user.post('/forget', devModeCheck, function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var new_password = req.body.new_password;
    EmailSchema.findOne({
        _id: email,
        password: password
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error');
        } else {
            if (user) {
                EmailSchema.updateOne({
                    _id: email
                }, {
                    $set: {
                        password: new_password
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                        res.send('Error');
                    } else {
                        res.redirect('/login');
                    }
                });
            } else {
                res.send('Error');
            }
        }
    })
});

user.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = user;