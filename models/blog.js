/// making a model for the blog
const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
}
const NotString = {
    type: String,
    required: false,
}
const list = {
    type: Array,
    required: false,
}
const blogSchema = new mongoose.Schema({
    _id: reqString, // blog id
    title: reqString,
    body: reqString,
    author: reqString, // email
    date: reqString,
    comments: [
        {
            _id: reqString, // comment id
            author: reqString, // username
            body: reqString,
            date: NotString
        }
    ]
})
module.exports = mongoose.model('blog', blogSchema)