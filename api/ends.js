var express = require('express');
const api = express.Router();
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../functions/index');
const config = require('../config');
const EmailSchema = require('../models/login');
const bodyParser = require('body-parser');
require('dotenv').config();
    
const check_headers = async (req, res) => {
    /// check headers for email
    if (req.headers.email) {
        return 100
    } else {
        return 2
    }
}

const APIlimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
    max: async (req, res) => {
        /// check headers for email
        if (await check_headers(req, res) === 100) {
            return 100
        } else {
            return 2
        }
    },
    handler: (req, res) => {
        res.status(429).send('Woah, You have used 100 requests. Please wait 15 minutes before trying again.');
    },
	standardHeaders: true,
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