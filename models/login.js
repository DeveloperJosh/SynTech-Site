const mongoose = require('mongoose');

/// mongo logins model

const reqString = {
    type: String,
    required: true,
}

const NotString = {
    type: String,
    required: false,
}

const EmailSchema = new mongoose.Schema({
    _id: reqString, // email
    username: NotString,
    password: reqString,
    admin: {
        type: Boolean,
        default: false
    },
    premium: {
        type: Boolean,
        default: false
    },
    apikey: NotString

})
module.exports = mongoose.model('logins', EmailSchema)