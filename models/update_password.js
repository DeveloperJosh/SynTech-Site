
const mongoose = require('mongoose')

/// update password model

const reqString = {
    type: String,
    required: true,
}
const updatePasswordSchema = new mongoose.Schema({
    _id: reqString, // email
    password: reqString,
})
module.exports = mongoose.model('updatePassword', updatePasswordSchema)