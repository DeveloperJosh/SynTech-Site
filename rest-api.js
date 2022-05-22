var express = require('express');
var app = express();
var fs = require("fs");
var fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

app.get('/', function (req, res) {
    res.send('Info Coming soon!');

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

  app.param('image_name', function(req, res, next, image) {
    fetch(`https://pixabay.com/api/?key=${process.env.IMAGE_KEY}&q=${image}&image_type=photo&pretty=true`).then(response => response.json())
    .then(data => {
        var random = Math.floor(Math.random() * data.hits.length);
        res.send(data.hits[random]);
    })
  });

app.get('/api/image/:image_name', function (req, res) {
    res.send(req.image_name);
});
  
app.get('/api/weather/:city', function(req, res) {
    res.send(req.city);

});    

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });