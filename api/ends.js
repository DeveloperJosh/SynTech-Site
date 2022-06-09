var express = require('express');
const api = express.Router();
const path = require('path');
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../functions/index');
require('dotenv').config();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after an hour',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(express.static(__dirname + '/public'));

api.get('/', function(req, res) {
    /// check if the ip is on lmitlist
    res.send({ message: 'Welcome to the API', version: '1.0.0', ip: `Here is the request ip ${req.ip}` });
});

api.get('/image', limiter, function(req, res) {
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