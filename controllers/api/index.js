var express = require('express');
const api = express.Router();
const rateLimit  = require('express-rate-limit');
const find = require('../../functions/index');
const makeid = require('../../functions/number_gen');
const config = require('../config');
const EmailSchema = require('../../models/login');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const limiter = async (req, res) => {
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

function api_key_check(req, res, next) {
    if (req.headers.authorization) {
        const apikey = req.headers.authorization;
        const key = EmailSchema.findOne({
            apikey: apikey,
        });
        if (key) {
            next();
        } else {
            res.status(401).json({
                message: 'Invalid API key',
            });
        }
    } else {
        res.status(401).json({
            message: 'Invalid API key',
        });
    }
}


function getJoke() {
    const jokeList = fs.readFileSync(path.join(__dirname, './list/dadjokes.txt'), 'utf8').split('\n');
    const randomJoke = jokeList[Math.floor(Math.random() * jokeList.length)];
    return randomJoke;
}

function getNSFW() {
    const nsfwList = fs.readFileSync(path.join(__dirname, './list/nsfw.txt'), 'utf8').split('\n');
    const randomNSFW = nsfwList[Math.floor(Math.random() * nsfwList.length)];
    /// remove the /r/ from the end of the string
    const nsfw = randomNSFW.slice(0, -1);
    return nsfw;
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
    });
}

const APIlimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
    max: async (req, res) => {
        if (await limiter(req, res) === true) {
            return config.api_limit_paid;
        } else {
            return config.api_limit_free;
        }
    },
    handler: (req, res) => {
        if (limiter(req, res) === true) {
            res.status(429).send({ error: 'Too Many Requests, Please try again in 1 hour.' });
        } else {
           text = `Woah there, You used ${config.api_limit_free} request's I think you should get a api key.`
           res.status(429).send({ error: text});
        }
    },
	standardHeaders: true,
    legacyHeaders: false
})

api.get('/', function(req, res) {
    res.send({ message: 'Welcome to the API', version: config.version});
});

api.get('/ip', (req, res) => res.send(req.ip))

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

api.get('/nsfw', api_key_check, APIlimiter, function(req, res) {
   res.send({ url: getNSFW() });
});


api.get('/dadjokes', APIlimiter, function(req, res) {
    res.send({ joke: getJoke() });
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