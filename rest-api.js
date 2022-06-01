var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
var session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const EmailSchema = require('./models/login');
require('dotenv').config();
let url = process.env.URL
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log('Unable to connect to MongoDB Database.\nError: ' + err)
})

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'html'));
app.use(express.urlencoded({
    extended: true
})) 

var sess = {
    secret: 'kfhiguydsgdfuyegudfudgsaugd67236467327',
    store: MongoStore.create({ mongoUrl: url }),
    cookie: {},
    resave: false,
    saveUninitialized: true
  }
  
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }
  
  app.use(session(sess))

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

router.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/login.html'));
});

router.post('/login', function(req, res) {
    /// check if user exists
    // save email to session
    // redirect to dashboard
    var email = req.body.email;
    EmailSchema.findOne({
        email: email,
        password: req.body.password
    }, function(err, email) {
        if (err) {
            console.log(err);
        } else if (email) {
            req.session.email = email;
            res.redirect('/dashboard');
        } else {
            res.redirect('/login');
        }
    });
});

router.get('/forget', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/forget.html'));
});

router.post('/forget', function(req, res) {
    /// check if email exists
    /// then get new password
    /// send email with new password
    var email = req.body.email;
    var password = req.body.password;
    var new_password = req.body.new_password;
    EmailSchema.findOne({
        email: email,
        password: password
    }, function(err, email) {
        if (err) {
            console.log(err);
        } else if (email) {
            email.password = new_password;
            email.save();
            console.log('Password changed');
            res.redirect('/login');
        } else {
            res.redirect('/forget');
        }
    }) 
});

router.delete('/delete', function(req, res) {
    if (req.session.email) {
        req.session.destroy();
        EmailSchema.deleteOne({
            email: req.body.email
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        })
    } else {
        res.redirect('/login');
    }
});



router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    })
});

router.get('/register', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/register.html'));
});

router.post('/register', function(req, res) {
    var user = new EmailSchema({
        _id: req.body.email,
        password: req.body.password
    });
    user.save(function(err) {
        if (err) {
            res.redirect('/register');
            console.log(err);
        } else {
            res.redirect('/login');
        }
    })
});

router.get('/dashboard', function(req, res) {
    if (req.session.email ) {
        res.sendFile(path.join(__dirname + '/html/dashboard.html'));
    } else {
        console.log('User not logged in');
        res.redirect('/login');
    }
});

app.use('/', router);
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});