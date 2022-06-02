import _ from 'lodash';
import { config } from 'dotenv';
import db from '../services/db.js';
import { officeTypes, formatBytes, asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';
import { getDataFromDb, insertIntoDb } from '../utils/dbOps.js';

config();

const fileUpload = asyncCatchInsert(async (req, res, _next) => {
	if (req.files.length == 0) {
		return res.status(400).json({
			status: 'error',
			message: 'No files were uploaded'
		});
	}

	const {
		report_id,
		category_id,
		sub_category_id,
		month,
		year,
		parish_code,
		area_code,
		zone_code,
		prov_code,
		reg_code,
		sub_cont_code,
		cont_code,
		date_of_activity,
		description
	} = req.body;
	
	let data = [];

	for (let file of req.files) {
		let imageData = {}

		if (report_id) imageData.report_id = report_id;
		if (category_id) imageData.category_id = category_id;
		if (sub_category_id) imageData.sub_category_id = sub_category_id;
		if (month) imageData.month = month;
		if (year) imageData.year = year;
		if (parish_code) imageData.parish_code = parish_code;
		if (area_code) imageData.area_code = area_code;
		if (zone_code) imageData.zone_code = zone_code;
		if (prov_code) imageData.prov_code = prov_code;
		if (reg_code) imageData.reg_code = reg_code;
		if (sub_cont_code) imageData.sub_cont_code = sub_cont_code;
		if (cont_code) imageData.cont_code = cont_code;
		if (date_of_activity) imageData.date_of_activity = date_of_activity;
		if (description) imageData.description = description;

		imageData.file_name = file.originalname.split(' ').join('_');
		imageData.file_size = formatBytes(file['size']);
		imageData.file_key 	= file['key'];
		imageData.aws_bucket_url = process.env.AWS_BUCKET_URL;

		if (_.has(officeTypes, file.mimetype.split('/')[1])) {
			imageData.file_type = officeTypes[file.mimetype.split('/')[1]];
		} else {
			imageData.file_type = file.mimetype.split('/')[1];
		}

		data.push(imageData);
	}

	const result = await insertIntoDb(db('csr_files'), data);

	if (result) {
		return res.status(200).json({ 
			status: "success",
			data: result
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'File Upload unsuccessful'
		})
	}
});

const getCsrFiles = asyncCatchRegular(async (req, res, _next) => {
	const csrReports = await getDataFromDb(req, db('csr_files'));

	if (csrReports) {
		for (let report of csrReports) {
			const file_key = report['file_key'];
			const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
			report['file_path'] = file_path;
		}

		return res.status(200).json({
			status: 'success',
			data: csrReports
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});
 
export { fileUpload, getCsrFiles };