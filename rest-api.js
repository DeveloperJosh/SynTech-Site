var express = require('express');
var app = express();
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const EmailSchema = require('./models/login');
const blogSchema = require('./models/blog');
const devModeSchema = require('./models/devmode');
var cookieSession = require('cookie-session');
const api = require('./controllers/api/index');
const admin = require('./controllers/admin/index');
const makeid = require('./functions/number_gen');
var logger = require('morgan');
var bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');
const { MessageEmbed, WebhookClient } = require('discord.js');

const webhookClient = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN });
require('dotenv').config();

paypal.configure({
    'mode': 'live', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });

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

function devModeCheck(req, res, next) {
    devModeSchema.findOne({
        _id: req.hostname
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
            const newDevMode = new devModeSchema({
                _id: req.hostname,
                dev_mode: false
            })
            newDevMode.save()
            res.redirect('/')
        }
    })
}

router.get('/', devModeCheck, function(req, res) {
    res.render('index.html')
});

router.get('/blog', devModeCheck, function(req, res) {
        res.render('blog.html')
});

router.post('/blog', function(req, res) {
    const blog = new blogSchema({
        _id: makeid(32),
        title: req.body.title,
        body: req.body.body,
        author: req.session.user.username,
        date: new Date().toLocaleString(),
        comments: []
    })
    blog.save().then(() => {
        res.redirect('/blog')
    }
    ).catch((err) => {
        console.log(err)
    })
});

router.get('/blog/all', function(req, res) {
    blogSchema.find().then((blogs) => {
        res.send(blogs)
    }).catch((err) => {
        console.log(err)
    })
});

router.delete('/blog/:id', function(req, res) {
    blogSchema.deleteOne({
        _id: req.params.id
    }).then(() => {
        res.send('deleted')
    }).catch((err) => {
        console.log(err)
    })
});

router.get('/login', devModeCheck, function(req, res) {
        res.render('login.html')
});

router.post('/login', function(req, res) {
    let email = req.body.email;
    if (email) {
        EmailSchema.findOne({
            _id: email
        }, (err, user) => {
            if (err) {
                console.log(err)
            } else if (user) {
                if (user.password === req.body.password) {
                    req.session.user = user
                    res.redirect('/dashboard')
                } else {
                    res.redirect('/login')
                }
            } else {
                res.redirect('/login')
            }
        })
    } else {
        res.redirect('/login')
    }
});

router.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/');
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


router.get('/register', devModeCheck, function(req, res) {
    res.render('register.html')
});

router.post('/register', function(req, res) {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
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
                        username: username,
                        password: password,
                        admin: false,
                        premium: false
                    });
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send('Error: ' + err);
                        } else {
                            req.session.user = newUser;
                            res.redirect('/dashboard');
                        }
                    });
                } else {
                    res.send('Passwords do not match');
                }
            }
        }
    })
}); 

router.get('/dashboard', devModeCheck, function(req, res) {
    if (req.session.user) {
        res.render('dashboard.html')
    } else {
        res.redirect('/login');
    }
});

router.get('/forget', devModeCheck, function(req, res) {
    res.render('forget.html')
});

router.post('/forget', devModeCheck, function(req, res) {
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

router.get('/shop', devModeCheck, function(req, res) {
    if (req.session.user) {
        res.render('buy.html')
    } else {
        res.redirect('/login');
    }
});

router.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://syntech.lol/success",
          "cancel_url": "http://syntech.lol/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Premium Account",
                  "sku": "001",
                  "price": "5.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "5.00"
          },
          "description": "A premium account will get you 2000+ requests per 15 minutes and top tir support and a badge on your profile and discord name in the server."
      }]
};
  
paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
});

router.get('/success', devModeCheck, (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "5.00"
          }
    }]
};
  
paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
          console.log(error.response);
          throw error;
    } else {
          user = req.session.user
            EmailSchema.updateOne({
                _id: user,
                premium: true
            }, function(err) {
                if (err) {
                    console.log(err);
                    res.send('Error');
                } else {
                    const embed = new MessageEmbed()
                    .setTitle('Account Upgrade')
                    .setDescription(`${user.username} has upgraded their account to premium!`)
                    .setColor('#0099ff');
                
                    webhookClient.send({
                    username: `${user.username}`,
                    avatarURL: 'https://www.iconpacks.net/icons/2/free-store-icon-1977-thumb.png',
                    embeds: [embed],
                    });
                    res.render('success.html')
                }
            }
        );
      }
  });
});

router.get('/cancel', (req, res) => res.send('Cancelled'));


app.use('/', router);
app.use('/api', api);
app.use('/admin', admin);

app.use((req, res, next) => {
    res.status(404).render('error.html');
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