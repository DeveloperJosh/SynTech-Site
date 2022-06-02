
const mongoose = require('mongoose')

/// update password model

const reqString = {
    type: String,
    required: true,
}

const devModeSchema = new mongoose.Schema({
    /// see if dev mode is on
    _id: reqString, // site url
    dev_mode: {
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model('DevMode', devModeSchema)