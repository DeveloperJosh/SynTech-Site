var express = require('express');
const api = express.Router();
const path = require('path');
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../functions/index');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after an hour',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

function premium(ip) {
    /// vpn ids
    premium_ip = ['89.238.142.238', '::1']
    if (ip === premium_ip) {
        return true
    }
    return false
}

check_premium = (req, res, next) => {
    if (premium(req.ip)) {
        next()
    } else {
        res.status(403).send('Forbidden')
    }
}

app.use(express.static(__dirname + '/public'));

api.get('/', function(req, res) {
    res.send({ message: 'Welcome to the API', version: '1.0.0', ip: `Here is the request ip ${req.ip}` });
});

api.get('/premium', check_premium, function(req, res) {
    res.send({ message: 'You are a premium user' });
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