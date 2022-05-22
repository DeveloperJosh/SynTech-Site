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
});

app.get('/api/weather/:city', function(req, res) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'community-open-weather-map.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.API_KEY
        }};
    fetch(`https://community-open-weather-map.p.rapidapi.com/weather?q=${req.params.city}`, options)
    .then(response => response.json())
    .then(data => {
        res.json(data);
    })
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});