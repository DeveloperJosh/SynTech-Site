var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const EmailSchema = require('./models/login');
var cookieSession = require('cookie-session')

require('dotenv').config();

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

let url = process.env.URL
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log('Unable to connect to MongoDB Database.\nError: ' + err)
})

app.set('views', path.join(__dirname, 'html'));
app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: [makeid(32)],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(express.urlencoded({
    extended: true
})) 
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

router.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/login.html'));
});

router.post('/login', function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    EmailSchema.findOne({
        email: email,
        password: password
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error');
        } else {
            if (user) {
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                res.send('Error');
            }
        }
    })
});


router.get('/register', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/register.html'));
});

router.post('/register', function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirm_password;

    /// check if email already exists
    EmailSchema.findOne({
        _id: email
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error: ' + err);
        } else {
            if (user) {
                res.send('Email already exists');
            } else {
                if (password === confirmPassword) {
                    let newUser = new EmailSchema({
                        _id: email,
                        password: password
                    });
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        } else {
                            res.send('Successfully registered');
                        }
                    });
                } else {
                    res.send('Passwords do not match');
                }
            }
        }
    })
}); 

router.get('/dashboard', function(req, res) {
    if (req.session.user) {
        res.sendFile(path.join(__dirname + '/html/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});


router.get('/info', function(req, res) {
    // show session info
    console.log(req.session);
    res.send(req.session.user);
});


app.use('/', router);
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});