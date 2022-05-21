var express = require('express');
var app = express();
var fs = require("fs");
var fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

app.get('/', function (req, res) {
    var json = fs.readFileSync("./info.json");
    var data = JSON.parse(json);
    res.send(data);

})

app.param('city', function(req, res, next, city) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'community-open-weather-map.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.API_KEY
        }
    };
    
    fetch(`https://community-open-weather-map.p.rapidapi.com/weather?q=${city}`, options)
    .then(response => response.json())
    .then(data => {
        res.send(data);
    }
    )

  });
  
app.get('/api/weather/:city', function(req, res) {
    res.send(req.city);

});    

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });