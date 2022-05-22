var express = require('express');
var app = express();
var fs = require("fs");
const path = require('path');
var fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

app.get('/', function (req, res) {
    res.json({
        message: 'No API endpoint specified'
    });

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
    })
  });
  
app.get('/api/weather/:city', function(req, res) {
    res.send(req.city);

});   

app.get('/api/porn', function (req, res) {
    fetch('https://nekobot.xyz/api/image?type=blowjob')
    .then(response => response.json())
    .then(data => {
        const image = data['message']
        res.json({
            "url": image
        }) 
    })
  });


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });