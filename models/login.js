
const mongoose = require('mongoose')

/// mongo login model

const reqString = {
    type: String,
    required: true,
}
const EmailSchema = new mongoose.Schema({
    _id: reqString, // email
    password: reqString,
})
module.exports = mongoose.model('login', EmailSchema)