const devModeSchema = require('./../models/devmode');

function devModeCheck(req, res, next) {
    devModeSchema.findOne({
        _id: req.hostname
    }, (err, devMode) => {
        if (err) {
            console.log(err)
        } else if (devMode) {
            if (devMode.dev_mode) {
                res.render('devmode.html')
            } else {
                next()
            }
        } else {
            const newDevMode = new devModeSchema({
                _id: req.hostname,
                dev_mode: false
            })
            newDevMode.save()
            res.redirect('/')
        }
    })
}

module.exports = devModeCheck;