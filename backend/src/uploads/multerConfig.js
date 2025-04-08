import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/aws.js";

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET_NAME,
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			const fileName = `${Date.now()}-${file.originalname}`;
			cb(null, fileName);
		},
	}),
});

export default upload;
