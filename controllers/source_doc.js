import isEmpty from 'lodash/isEmpty.js';
import _ from 'lodash';
import { config } from 'dotenv';
import db from '../services/db.js';
import { formatBytes } from '../utilities/helpers.js';

config();

const fileUpload = async (req, res, _next) => {
	try {
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
			service_date,
			description
		} = req.body;

		let service_id_check 	= service_id != '' && service_id != null;
		let parish_code_check 	= parish_code != '' && parish_code != null;
		let area_code_check 	= area_code != '' && area_code != null;
		let zone_code_check 	= zone_code != '' && zone_code != null;
		let province_code_check = prov_code != '' && prov_code != null;
		let region_code_check 	= reg_code != '' && reg_code != null;

		if (service_id_check && parish_code_check && area_code_check && zone_code_check && province_code_check && region_code_check) {

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
			if (service_date) imageData.service_date = service_date;
			if (description) imageData.description = description;

			imageData.file_name = req.file.originalname.replace(' ', '_');
			imageData.file_size = formatBytes(req.file.size);
			imageData.file_key 	= req.file.key
			imageData.file_type = req.file.mimetype.split('/')[1];

			const found_docs = await db('source_docs').where({ service_id: service_id, report_att_id: report_att_id });
			
			if (found_docs.length > 0) {
				const result = await db('source_docs').where({ id: found_docs[0].id }).update(imageData).returning('*');
				return res.status(200).json({
					status: 'success',
					message: 'File updated successfully',
					data: result
				});
			} else {
				const result = await db('source_docs').insert(imageData).returning('*');
				return res.status(200).json({ 
					status: "success",
					message: "File uploaded successfully",
					data: result
				});
			}
		} else {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		}
	} catch (error) {
		console.log(error)
		return error;
	}
}

const getSourceDocs = async (req, res, _next) => {
	try {
		const {
			id,
			service_id,
			report_att_id,
			week,
			month,
			year,
			parish_code,
			area_code,
			prov_code,
			reg_code,
			service_date,
			description,
			page,
			limit,
			sort,
			order
		} = req.query;

		let query_data = {};
		let pageNum;
		let limitNum;
		let sortBy;
		let sortOrder;

		if (id) query_data.id = id;
		if (service_id) query_data.service_id = service_id;
		if (report_att_id) query_data.report_att_id = report_att_id;
		if (week) query_data.week = week;
		if (month) query_data.month = month;
		if (year) query_data.year = year;
		if (parish_code) query_data.parish_code = parish_code;
		if (area_code) query_data.area_code = area_code;
		if (prov_code) query_data.prov_code = prov_code;
		if (reg_code) query_data.reg_code = reg_code;
		if (service_date) query_data.service_date = service_date;
		if (description) query_data.description = description;

		if (page) { pageNum = parseInt(page); } else { pageNum = 0; }
		if (limit) { limitNum = parseInt(limit); } else { limitNum = 100; }
		if (sort) { sortBy = sort; } else { sortBy = 'id'; }
		if (order) { sortOrder = order; } else { sortOrder = 'asc'; }

		if (isEmpty(query_data)) {
			const data = await db('source_docs')
				.orderBy(sortBy, sortOrder)
				.offset(pageNum)
				.limit(limitNum);

			if (data.length > 0) {
				/* const addFilesToReport = data.map( async each => {
					
					return each;
				});

				const attReports = await Promise.all(addFilesToReport); */
				return res.status(200).json({
					status: 'success',
					data: data
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found'
				});
			}
		} else {
			const data = await db('source_docs')
				.where(query_data)
				.orderBy(sortBy, sortOrder)
				.offset(pageNum)
				.limit(limitNum);

			if (data.length > 0) {
				return res.status(200).json({
					status: 'success',
					data: data
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found'
				});
			}
		}
	} catch (error) {
		console.log(error)
	}
}
 
export { fileUpload, getSourceDocs };