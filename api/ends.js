var express = require('express');
const api = express.Router();
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../functions/index');
const config = require('../config');
const EmailSchema = require('../models/login');
require('dotenv').config();
    
const check_headers = async (req, res) => {
    /// check headers for email
    if (req.headers.email) {
        /// check if email is in database
        const email = req.headers.email;
        const password = req.headers.password;
        const user = await EmailSchema.findOne({
            _id: email,
            password: password,
        });
        if (user) {
            /// if user is in database
            return true;
        } else {
            /// if user is not in database
            return false;
        }
    } else {
        /// if email is not in headers, kill request
        return false;
    }
}

const APIlimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
    max: async (req, res) => {
        /// check headers for email
        if (await check_headers(req, res) === true) {
            return 1000;
        } else {
            return 100;
        }
    },
    handler: (req, res) => {
        /// check headers for email
        if (check_headers(req, res) === true) {
            /// if email is in database
            res.status(429).send({ error: 'Too Many Requests' });
        } else {
            /// if email is not in database
            res.status(429).send({ error: 'You have exceeded the limit of requests, please try again in 15 minutes. For more requests, please add your email and password to the headers.' });
        }
    },
	standardHeaders: true,
    legacyHeaders: false
})

app.use(express.static(__dirname + '/public'));

api.get('/', function(req, res) {
    res.send({ message: 'Welcome to the API', version: config.version, ip: `Here is the request ip ${req.ip}` });
});

api.get('/image', APIlimiter, function(req, res) {
    /// let user pick a subreddit
    var meme = req.query.subreddit;
    var limit = req.query.limit;
    if (meme) {
        /// get the meme from the subreddit
        find({ subreddit: meme, limit: limit}).then(function(posts) {
            res.send({ url: posts });
        })
    } else {
        /// get the meme from the subreddit
        find({ subreddit: 'memes', limit: 30 }).then(function(posts) {
            /// get url from posts
           res.send({ url: posts });
        });
    }
});

module.exports = api;