/// making a model for the blog
const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
}
const blogSchema = new mongoose.Schema({
    _id: reqString, // blog id
    title: reqString,
    body: reqString,
    author: reqString, // email
    date: reqString,
    comments: [{
        _id: reqString, // comment id
        body: reqString
    }]
})
module.exports = mongoose.model('blog', blogSchema)