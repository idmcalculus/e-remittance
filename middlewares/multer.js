import multer from 'multer';
import { v4 as uuid } from 'uuid';
import multerS3 from 'multer-s3';
import { config } from 'dotenv';
import s3 from '../services/s3.js';

config();

const csrImageUpload = (req, res, next) => {
	const upload = multer({
		limits: 10,
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET_NAME,
			acl: 'public-read',
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			key: function (req, file, cb) {
				let file_name = file.originalname.replace(' ', '_');
				cb(null, `csr_images/${uuid()}-${file_name}`);
			}
		})
	}).array('file', 10);

	upload(req, res, (error) => {
		if (error instanceof multer.MulterError) {
			return res.status(400).json({
				message: 'Upload unsuccessful', 
                errorMessage: error.message,
                errorCode: error.code
			});
		}
		
		if (error) {
			return res.status(500).json({
                message: 'Error occured',
                errorMessage: error.message
            });
		}

		next();
	});
}

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const sourceDocUpload = (req, res, next) => {
	const upload  = multer({
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET_NAME,
			acl: 'public-read',
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			key: function (req, file, cb) {
				let file_name = file.originalname.replace(' ', '_');
				cb(null, `source_doc/${uuid()}-${file_name}`);
			}
		}),
		fileFilter: fileFilter
	}).single('file');

	upload(req, res, (error) => {
		if (error instanceof multer.MulterError) {
			return res.status(400).json({
				message: 'Upload unsuccessful', 
                errorMessage: error.message,
                errorCode: error.code
			});
		}
		
		if (error) {
			return res.status(500).json({
                message: 'Error occured',
                errorMessage: error.message
            });
		}

		next();
	});
}

export { csrImageUpload, sourceDocUpload };