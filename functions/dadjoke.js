var text = require('./jokes/list.txt');

function dadjokes() {
    /// get dadjokes from list.txt and pick one at random
    var dadjokes = text.split('\n');
    var random = Math.floor(Math.random() * dadjokes.length);
    return console.log(dadjokes[random]);
}

module.exports = dadjokes