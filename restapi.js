var express = require('express');
var app = express();
var fs = require("fs");

app.get('/data', function (req, res) {
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info);
})

app.get('/', function (req, res) {
    res.send('Hello This is the Syn Rest API');
})

app.get('/users', function (req, res) {
    //get all users
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info.users);
})

app.get('/image', function (req, res) {
    images = [
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://blue.is-from.space/chrome_y3BJ1W6xd7.png",
    ]
    res.send(images[Math.floor(Math.random() * images.length)]);
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });