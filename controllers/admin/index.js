var express = require('express');
const { format } = require('path');
const admin = express.Router();
const find = require('../../functions/index');
const makeid = require('../../functions/number_gen');
const EmailSchema = require('../../models/login');
const config = require('../config');

function is_admin(req, res, next) {
    /// check with database
    EmailSchema.findOne({
        _id: req.session.user,
        admin: true
    }, (err, admin) => {
        if (err) {
            console.log(err)
        } else if (admin) {
            next();
        } else {
            res.status(403).send({ error: 'You are not an admin' });
        }
    })
}

admin.get('/', is_admin, function(req, res) {
     res.render('admin')
});

admin.get('/config', is_admin, function(req, res) {
    /// send config file in a good format
    res.send({ config: config });

});

module.exports = admin;