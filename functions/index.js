const fetch = require('node-fetch');

function check(link) {
    /// check if link ends with .jpg or .png or .gif
    if (link.endsWith('.jpg') || link.endsWith('.png') || link.endsWith('.gif') || link.endsWith('.jpeg')) {
        /// check if link is a video
        return true
    }
    return false
}

function find(params) {
    /// returns a single image from a subreddit
    const iamge = `https://www.reddit.com/r/${params.subreddit}.json?sort=top&t=week&limit=50`;
    return fetch(iamge)
        .then(res => res.json())
        .then(json => {
            const posts = json.data.children;
            const post = posts[Math.floor(Math.random() * posts.length)];
            const link = post.data.url;
            if (check(link)) {
                return link
            }
            return find(params)
        })
        .catch(err => {
            console.log(err);
            return 'We are having trouble finding a image for you. Please try again later.'
        });
}

module.exports = find;