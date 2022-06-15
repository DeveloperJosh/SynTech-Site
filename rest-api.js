var express = require('express');
var app = express();
const path = require('path');
const mongoose = require('mongoose');
var cookieSession = require('cookie-session');
const router = require('./controllers/home/index');
const api = require('./controllers/api/index');
const admin = require('./controllers/admin/index');
const shop = require('./controllers/shop/index');
const user = require('./controllers/user/index');
const blog = require('./controllers/blog/index');
const makeid = require('./functions/number_gen');
var logger = require('morgan');
var bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(logger('dev'));

app.use(cookieSession({
    name: 'session',
    keys: [makeid(32)],
  }));

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