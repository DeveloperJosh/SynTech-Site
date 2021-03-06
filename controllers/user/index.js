var express = require('express');
const user = express.Router();
const makeid = require('../../functions/number_gen');
const devModeCheck = require('../../functions/devmodecheck');
const config = require('../config');
const EmailSchema = require('../../models/login');
const tokenSchema = require('../../models/token');
const sender = require('../../functions/email');
require('dotenv').config();

user.use(express.static(__dirname + '.../public'));

function is_logged_in(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render('login');
    }
}

user.get('/', devModeCheck, is_logged_in, function(req, res) {
    res.render('dashboard');
});

user.get('/login', devModeCheck, function(req, res) {
    res.render('login')
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
                res.redirect('/user/login')
            }
        } else {
            res.redirect('/user/login')
        }
    })
} else {
    res.redirect('/user/login')
}
});

user.get('/register', devModeCheck, function(req, res) {
    res.render('register')
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
                            sender(email, 'Welcome to SynTech', `Welcome to SynTech!\n\nYou have successfully registered for SynTech.\n\nYou need to verify your account at http://${req.hostname}/user/verify/${token}\n\nThank you for using SynTech!`)
                            res.redirect('/user');
                        }
                    });
                } else {
                    res.send('Passwords do not match');
                }
            }
        }
    })
}); 

user.get('/verify/:token', is_logged_in, function(req, res) {
    let token = req.params.token;
    try {
        /// find user by id and token and update verified to true and delete token
        tokenSchema.findOne({
            token: token
        }, function(err, user) {
            if (err) {
                console.log(err);
                res.send('Error: ' + err);
            } else {
                if (user) {
                    EmailSchema.findOneAndUpdate({
                        _id: req.session.user._id
                    }, {
                        verified: true
                    }, function(err, user) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        }
                    }
                    )
                    tokenSchema.deleteOne({
                        _id: req.session.user._id
                    }, function(err, user) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        }
                    }
                    )
                    /// send message then redirect to dashboard
                    sender(req.session.user._id, 'Account Verified', `Your account has been verified, Please log back in to remove banner.\n\nThank you for using SynTech!`)
                    res.redirect('/user');
                } else {
                    res.send('Invalid token')
                }
            }
        }
        )
    }
    catch (err) {
        console.log(err)
    }

});

user.get('/resend', is_logged_in, function(req, res) {
    /// send email with token
    tokenSchema.findOne({
        _id: req.session.user._id
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error: ' + err);
        } else {
            if (user) {
                sender(req.session.user._id, 'Verify Account', `Please verify your account at http://${req.hostname}/user/verify/${user.token}\n\nThank you for using SynTech!`)
                res.redirect('/user');
            } else {
                res.send('Invalid token')
            }
        }
    });
});

user.get('/forget', devModeCheck, function(req, res) {
    res.render('forget')
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

user.get('/logout', is_logged_in, function(req, res) {
    req.session = null;
    res.redirect('/');
});

user.delete('/delete', is_logged_in, function(req, res) {
    // TODO: add user delete functionality
    user = req.session.user._id
    EmailSchema.deleteOne({
        _id: user
    }).then(() => {
        res.redirect('/')
    }
    ).catch((err) => {
        console.log(err)
    }
    )
});

module.exports = user;