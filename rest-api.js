var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const EmailSchema = require('./models/login');
const blogSchema = require('./models/blog');
const tokenSchema = require('./models/token');
var cookieSession = require('cookie-session');
const api = require('./controllers/api/index');
const admin = require('./controllers/admin/index');
const shop = require('./controllers/shop/index');
const user = require('./controllers/user/index');
const blog = require('./controllers/blog/index');
const makeid = require('./functions/number_gen');
const sender = require('./functions/email');
const devModeCheck = require('./functions/devmodecheck');
var logger = require('morgan');
var bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(logger('dev'));

app.use(cookieSession({
    name: 'session',
    keys: [makeid(32)],
  }))

app.use(express.urlencoded({
      extended: true
  })) 

app.disable('x-powered-by');

app.use(function (req, res, next) {
    res.setHeader('Powered-By', 'SynTech')
    res.setHeader('Made-By', 'Blue at SynTech')
    next()
  })

let url = process.env.URL;
mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'SynTech'
    }).then(() => {
        console.log('Connected to MongoDB')
    }).catch((err) => {
        console.log('Unable to connect to MongoDB Database.\nError: ' + err)
})


app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('trust proxy', 1)
app.use(express.static(__dirname + '/public'));

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

router.delete('/delete', function(req, res) {
    // TODO: add user delete functionality
    user = req.session.user._id
    EmailSchema.deleteOne({
        _id: user
    }).then(() => {
        res.redirect('/')
    }
    ).catch((err) => {
        console.log(err)
    }
    )
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

app.use('/', router);
app.use('/api', api);
app.use('/admin', admin);
app.use('/shop', shop);
app.use('/user', user);
app.use('/blog', blog);

app.use((req, res, next) => {
    res.status(404).send({ error: 'Not found' });
});
  
app.use((error, req, res, next) => {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500,
          message: error.message || 'Internal Server Error',
        },
    });
});

app.listen(process.env.PORT || 3000, function(){
    console.log("SynTech is running on port %d in %s mode", this.address().port, app.settings.env);
});