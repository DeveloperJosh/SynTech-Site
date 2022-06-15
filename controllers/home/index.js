var express = require('express');
const router = express.Router();
const EmailSchema = require('../../models/login');
const tokenSchema = require('../../models/token');
const sender = require('../../functions/email');
const devModeCheck = require('../../functions/devmodecheck');
const config = require('../config');

require('dotenv').config();

function is_logged_in(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send({ error: 'You are not logged in' });
    }
}

router.get('/', devModeCheck, function(req, res) {
    res.render('index.html')
});

router.get('/verify/:token', is_logged_in, function(req, res) {
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
                    res.redirect('/dashboard');
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

router.get('/info', function(req, res) {
    console.log(req.session);
    res.send(req.session.user);
});

router.get('/getemail', function(req, res) {
    email = req.session.user;
    email = email._id;
    res.send(email);
});

router.get('/username', function(req, res) {
    username = req.session.user;
    username = username.username;
    res.send(username);
});

router.get('/verified', function(req, res) {
    verified = req.session.user;
    verified = verified.verified;
    res.send(verified);
});

router.get('/admin_user', function(req, res) {
    admin_user = req.session.user;
    admin_user = admin_user.admin;
    res.send(admin_user);
});

module.exports = router;