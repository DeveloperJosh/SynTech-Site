var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const EmailSchema = require('./models/login');
const blogSchema = require('./models/blog');
const devModeSchema = require('./models/devmode');
var cookieSession = require('cookie-session')

/// TODO:
/// - add user delete functionality
/// - make an admin page

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
app.engine('html', require('ejs').renderFile);
app.set('trust proxy', 1) // trust first proxy
app.use(express.static(__dirname + '/public'));

app.use(cookieSession({
  name: 'session',
  keys: [makeid(32)],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(express.urlencoded({
    extended: true
})) 

// make a mongo check for dev mode
function devModeCheck(req, res, next) {
    /// check if dev mode is on and check if dev mode exists
    devModeSchema.findOne({
        _id: req.hostname
        /// if dev mode does not exist, create it then redirect and check if dev mode is true
    }, (err, devMode) => {
        if (err) {
            console.log(err)
        } else if (devMode) {
            if (devMode.dev_mode) {
                res.render('devmode.html')
            } else {
                next()
            }
        } else {
            /// create dev mode
            const newDevMode = new devModeSchema({
                _id: req.hostname,
                dev_mode: false
            })
            newDevMode.save()
            res.redirect('/')
        }
    })
}

router.get('/', function(req, res) {
    /// run dev mode check
    devModeCheck(req, res, () => {
        /// render the index page
        res.render('index.html')
    })
})

/// making a blog page
router.get('/blog', function(req, res) {
    devModeCheck(req, res, () => {
        res.render('blog.html')
    })
});

router.post('/blog', function(req, res) {
    const blog = new blogSchema({
        _id: makeid(32),
        title: req.body.title,
        body: req.body.body,
        author: req.session.user,
        date: new Date().toLocaleString(),
        comments: []
    })
    blog.save().then(() => {
        res.redirect('/blog')
    }
    ).catch((err) => {
        console.log(err)
    })
})

router.get('/blog/all', function(req, res) {
    blogSchema.find().then((blogs) => {
        res.send(blogs)
    }).catch((err) => {
        console.log(err)
    })
})

router.delete('/blog/:id', function(req, res) {
    blogSchema.deleteOne({
        _id: req.params.id
    }).then(() => {
        res.send('deleted')
    }).catch((err) => {
        console.log(err)
    })
})

router.get('/login', function(req, res) {
    devModeCheck(req, res, () => {
        res.render('login.html')
    })
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

router.get('/logout', function(req, res) {
    /// clear session
    req.session = null;
    res.redirect('/');
});


router.get('/register', function(req, res) {
    devModeCheck(req, res, () => {
        res.render('register.html')
    })
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
                        password: password,
                        admin: false
                    });
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        } else {
                            res.redirect('/login');
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
        res.render('dashboard.html')
    } else {
        res.redirect('/login');
    }
});

router.get('/admin', function(req, res) {
    EmailSchema.findOne({
        _id: req.session.user,
        admin: true
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error: ' + err);
        } else {
            if (user) {
                res.render('admin.html')
            } else {
                res.send('Error: You are not an admin');
            }
        }
    })
});

router.get('/admin/login', function(req, res) {    
    res.render('admin_login.html')
});

router.post('/admin/login', function(req, res) {
    /// check if email has admin rights
    EmailSchema.findOne({
        _id: req.body.email,
        admin: true
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error: ' + err);
        } else {
            if (user) {
                req.session.user = user;
                res.redirect('/admin');
            } else {
                res.send('Error: You are not an admin');
            }
        }
    })
});

router.get('/forget', function(req, res) {
    devModeCheck(req, res, () => {
        res.render('forget.html')
    })
});

router.post('/forget', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var new_password = req.body.new_password;
    EmailSchema.findOne({
        _id: email,
        password: password
    }, function(err, user) {
        if (err) {
            console.log(err);
            res.send('Error');
        } else {
            if (user) {
                EmailSchema.updateOne({
                    _id: email
                }, {
                    $set: {
                        password: new_password
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                        res.send('Error');
                    } else {
                        res.redirect('/login');
                    }
                });
            } else {
                res.send('Error');
            }
        }
    })
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