
const mongoose = require('mongoose')

/// mongo logins model

const reqString = {
    type: String,
    required: true,
}
const EmailSchema = new mongoose.Schema({
    _id: reqString, // email
    password: reqString,
    admin: {
        type: Boolean,
        default: false
    }

})
module.exports = mongoose.model('logins', EmailSchema)