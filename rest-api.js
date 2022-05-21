var express = require('express');
var app = express();
var fs = require("fs");
const fetch = require('node-fetch');
const { API_KEY } = require('./config');

app.get('/', function (req, res) {
    res.send('Hello This is the Syn Rest API');
})

app.param('city', function(req, res, next, city) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'community-open-weather-map.p.rapidapi.com',
            'X-RapidAPI-Key': API_KEY
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