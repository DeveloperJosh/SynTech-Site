var express = require('express');
const api = express.Router();
const app = express();
const rateLimit  = require('express-rate-limit');
const find = require('../functions/index');
const makeid = require('../functions/number_gen');
const config = require('./config');
const EmailSchema = require('../models/login');
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
            res.status(429).send({ error: 'Too Many Requests' });
        } else {
           res.status(429).send({ error: 'Woah there, You used 100 request\'s I think you should get a api key.' });
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

api.get('/key', function(req, res) {
    /// generate a new api key for the user
    user = req.session.user
    if (user) {
        /// see if the user has an apikey already if not generate one
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
                    const newKey = makeid(32);
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