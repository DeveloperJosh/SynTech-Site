var jokes = require('./list/jokes.txt');

function getJoke() {
    /// don't run till called
    let joke = jokes[Math.floor(Math.random() * jokes.length)];
    return joke;
}

module.exports = getJoke;