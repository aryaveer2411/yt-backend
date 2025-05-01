/**
 * Middleware configuration for handling file uploads using Multer.
 * 
 * - The `destination` function specifies the directory where uploaded files will be stored.
 * - The `filename` function generates a unique name for each uploaded file to avoid conflicts.
 * 
 * @module middlewares/multer.middleware
 * 
 * @description
 * This middleware is used to handle file uploads in the application. The `destination` callback
 * is used to specify the directory for storing files, while the `filename` callback generates
 * a unique name for each file. The `null` value in the callbacks indicates no error occurred,
 * while errors can be passed to the callback to reject the file upload.
 * 
 * @example
 * // Example of rejecting a file upload:
 * // if (file.originalname !== 'abc.txt') {
 * //     return cb(new Error('Only abc.txt is allowed!'));  // Reject
 * // }
 * 
 * @see {@link https://github.com/expressjs/multer Multer Documentation}
 */
import multer from "multer";


// filename: function (req, file, cb) {
//
//     if (file.originalname !== 'abc.txt') {
//         return cb(new Error('Only abc.txt is allowed!'));  // Reject
//     }

//     // Else, accept it
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix);  // Success
// }

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        console.log("file", file);
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })