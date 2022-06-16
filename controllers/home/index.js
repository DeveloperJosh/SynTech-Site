var express = require('express');
const router = express.Router();
const devModeCheck = require('../../functions/devmodecheck');
const config = require('../config');

require('dotenv').config();

function is_logged_in(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send({ error: 'You are not logged in' });
    }
};   

router.get('/', devModeCheck, function(req, res) {
    res.render('index')
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