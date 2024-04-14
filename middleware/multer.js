const multer = require('multer')

function productimage() {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/product')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '_' + file.originalname)
        }
    })
    const upload = multer({ storage: storage })
    return upload
}

function banner() {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/banner')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '_' + file.originalname)
        }
    })
    const upload = multer({ storage: storage })
    return upload

}


module.exports = {
    productimage,
    banner
}