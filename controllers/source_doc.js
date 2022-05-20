import _ from 'lodash';
import { config } from 'dotenv';
import db from '../services/db.js';
import { asyncCatchInsert, asyncCatchRegular, formatBytes } from '../utils/helpers.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';

config();

const fileUpload = asyncCatchInsert(async (req, res, _next) => {
	if (!req.file) {
		return res.status(400).json({
			status: 'error',
			message: 'No files were uploaded'
		});
	}
		
	if (req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'image/jpg' && req.file.mimetype != 'image/png') {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid file type, only images allowed'
		});
	}
	
	const {
		service_id,
		report_att_id,
		week,
		month,
		year,
		parish_code,
		area_code,
		zone_code,
		prov_code,
		reg_code,
		sub_cont_code,
		cont_code,
		service_date,
		description
	} = req.body;

	let imageData = {}

	if (service_id) imageData.service_id = service_id;
	if (report_att_id) imageData.report_att_id = report_att_id;
	if (week) imageData.week = week;
	if (month) imageData.month = month;
	if (year) imageData.year = year;
	if (parish_code) imageData.parish_code = parish_code;
	if (area_code) imageData.area_code = area_code;
	if (zone_code) imageData.zone_code = zone_code;
	if (prov_code) imageData.prov_code = prov_code;
	if (reg_code) imageData.reg_code = reg_code;
	if (sub_cont_code) imageData.sub_cont_code = sub_cont_code;
	if (cont_code) imageData.cont_code = cont_code;
	if (service_date) imageData.service_date = service_date;
	if (description) imageData.description = description;

	imageData.file_name = req.file.originalname.split(' ').join('_');
	imageData.file_size = formatBytes(req.file.size);
	imageData.file_key 	= req.file.key
	imageData.file_type = req.file.mimetype.split('/')[1];
	imageData.aws_bucket_url = process.env.AWS_BUCKET_URL;

	const found_docs = await getDataFromDb(req, db('source_docs'), { service_id, report_att_id });
	
	if (found_docs) {
		const result = await updateDb(db('source_docs'), imageData, { id: found_docs[0].id });

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'File updated successfully',
				data: result
			});
		} else {
			return res.status(400).json({
				status: 'fail',
				message: 'Error updating file'
			});
		}
	} else {
		const result = await insertIntoDb(db('source_docs'), imageData);

		if (result) {
			return res.status(200).json({ 
				status: "success",
				message: "File uploaded successfully",
				data: result
			});
		} else {
			return res.status(400).json({
				status: 'fail',
				message: 'Error inserting file'
			});
		}
	}
});

const getSourceDocs = asyncCatchRegular(async (req, res, _next) => {
	const attReports = await getDataFromDb(req, db('source_docs'));

	if (attReports) {
		for (let report of attReports) {
			const file_key = report['file_key'];
			const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
			report['file_path'] = file_path;
		}

		return res.status(200).json({
			status: 'success',
			data: attReports
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});
 
export { fileUpload, getSourceDocs };