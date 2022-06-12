var express = require('express');
const api = express.Router();
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../../functions/index');
const makeid = require('../../functions/number_gen');
const config = require('../config');
const EmailSchema = require('../../models/login');
require('dotenv').config();

const apikey_check = async (req, res) => {
    if (req.headers.authorization) {
        const apikey = req.headers.authorization;
        const key = await EmailSchema.findOne({
            apikey: apikey,
        });
        if (key) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function is_premium(req, res, next) {
    /// check with database
    EmailSchema.findOne({
        _id: req.session.user,
        premium: true
    }, (err, premium) => {
        if (err) {
            console.log(err)
        } else if (premium) {
            next();
        } else {
            res.status(403).send({ error: 'You are not a premium user' });
        }
    })
}

const APIlimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
    max: async (req, res) => {
        if (await apikey_check(req, res) === true) {
            return config.api_limit_paid;
        } else {
            return config.api_limit_free;
        }
    },
    handler: (req, res) => {
        if (apikey_check(req, res) === true) {
            res.status(429).send({ error: 'Too Many Requests, Please try again in 1 hour.' });
        } else {
           text = `Woah there, You used ${config.api_limit_free} request's I think you should get a api key.`
           res.status(429).send({ error: text});
        }
    },
	standardHeaders: true,
    legacyHeaders: false
})

app.use(express.static(__dirname + '/public'));

api.get('/', function(req, res) {
    res.send({ message: 'Welcome to the API', version: config.version});
});

app.get('/ip', (req, res) => res.send(req.ip))

api.get('/image', APIlimiter, function(req, res) {
    var meme = req.query.subreddit;
    var limit = req.query.limit;
    var nsfw = req.query.nsfw;
    if (meme) {
        find({ subreddit: meme, limit: limit, nsfw: nsfw}).then(function(posts) {
            res.send({ url: posts });
        })
    } else {
        find({ subreddit: 'memes', nsfw: false, limit: 30 }).then(function(posts) {
           res.send({ url: posts });
        });
    }
});

api.get('/key',is_premium, function(req, res) {
    user = req.session.user
    if (user) {
        const key = EmailSchema.findOne({
            _id: user,
        }, function(err, user) {
            if (err) {
                console.log(err);
                res.send('Error: ' + err);
            }
            if (user) {
                if (user.apikey) {
                    res.send({ apikey: user.apikey, message: 'If somone has your key please email us at support@syntech.dev' });
                }
                else {
                    const newKey = makeid(60);
                    EmailSchema.updateOne({
                        _id: user,
                    }, {
                        apikey: newKey,
                    }, function(err, user) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        }
                        if (user) {
                            res.send({ apikey: newKey });
                        }
                    });
                }
            }
        });
    } else {
        res.send({ message: 'You are not logged in' });
    }
});

module.exports = api;