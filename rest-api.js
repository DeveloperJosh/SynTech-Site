var express = require('express');
var app = express();
var fs = require("fs");

app.keys = ['secret'];
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/data', function (req, res) {
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info);
})

app.get('/', function (req, res) {
    res.send('Hello This is the Syn Rest API');
})

app.get('/users', function (req, res) {
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info.users);
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });