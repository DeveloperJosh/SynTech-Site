var express = require('express');
var app = express();
var fs = require("fs");
const fetch = require('node-fetch');

app.get('/info', function (req, res) {
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info);
})

app.get('/download', function (req, res) {
    //download file
    res.download('download/Program.exe');
})

app.get('/', function (req, res) {
    res.send('Hello This is the Syn Rest API');
})

app.get('/api/v1/users', function (req, res) {
    //get all users
    var data = fs.readFileSync("data.json");
    var info = JSON.parse(data);
    res.send(info.users);
})

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Rest app listening at loclhost", host, port)
})