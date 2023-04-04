const multer = require('multer');
const path = require('path');
const { existsSync, mkdirSync } = require('node:fs');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // console.log(file.mimetype);
//         // console.log(req);
//         if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//             cb(null, 'uploads/image');
//         } else {
//             cb({ result: false, errors: [{ meg: 'not image' }] }, null);
//         }
//         // console.log(file, '123');
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         const uniqueSuffix = Date.now() + '-' + path.extname(file.originalname);
//         cb(null, uniqueSuffix + '.jpg');
//         // console.log(file);
//     },
// });
const dir = './uploads/logo/image';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        // let math = ['image/png', 'image/jpeg', 'image/jpg'];
        // if (math.indexOf(file.mimetype) === -1) {
        //     let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
        //     return cb(errorMess, null);
        // }

        // console.log('log', file);
        cb(null, `${dir}`);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const uploadLogo = multer({ storage: storage });

module.exports = uploadLogo;
