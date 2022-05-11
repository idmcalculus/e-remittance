import db from '../services/db.js';
import { officeTypes, formatBytes } from '../utilities/helpers.js';
import isEmpty from 'lodash/isEmpty.js';
import _ from 'lodash';

const fileUpload = async (req, res, _next) => {
	try {
		if (req.files.length == 0) {
			return res.status(400).json({
				status: 'error',
				message: 'No files were uploaded'
			});
		} else {
			const {
				report_id,
				month,
				year,
				parish_code,
				area_code,
				zone_code,
				prov_code,
				reg_code,
				date_of_activity,
				description
			} = req.body;
			
			let data = [];

			for (let file of req.files) {
				let imageData = {}

				if (report_id) imageData.report_id = report_id;
				if (month) imageData.month = month;
				if (year) imageData.year = year;
				if (parish_code) imageData.parish_code = parish_code;
				if (area_code) imageData.area_code = area_code;
				if (zone_code) imageData.zone_code = zone_code;
				if (prov_code) imageData.prov_code = prov_code;
				if (reg_code) imageData.reg_code = reg_code;
				if (date_of_activity) imageData.date_of_activity = date_of_activity;
				if (description) imageData.description = description;

				imageData.file_name = file.originalname.replace(' ', '_');
				imageData.file_size = formatBytes(file.size);
				imageData.file_key 	= file.key

				if (_.has(officeTypes, file.mimetype.split('/')[1])) {
					imageData.file_type = officeTypes[file.mimetype.split('/')[1]];
				} else {
					imageData.file_type = file.mimetype.split('/')[1];
				}

				data.push(imageData);
			}

			const result = await db('csr_images').insert(data).returning('*');

			return res.status(200).json({ 
				status: "success",
				data: result
			});
		}
	} catch (error) {
		console.log(error)
		return error;
	}
}

const getCsrFiles = async (req, res, _next) => {
	try {
		const {
			id,
			report_id,
			month,
			year,
			parish_code,
			area_code,
			prov_code,
			reg_code,
			date_of_activity,
			description,
			page,
			limit,
			sort,
			order
		} = req.query;

		let query = {};
		let pageNum;
		let limitNum;
		let sortBy;
		let sortOrder;

		if (report_id) query.report_id = report_id;
		if (month) query.month = month;
		if (year) query.year = year;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (prov_code) query.prov_code = prov_code;
		if (reg_code) query.reg_code = reg_code;
		if (date_of_activity) query.date_of_activity = date_of_activity;
		if (description) query.description = description;

		if (page) { pageNum = parseInt(page); } else { pageNum = 0; }
		if (limit) { limitNum = parseInt(limit); } else { limitNum = 100; }
		if (sort) { sortBy = sort; } else { sortBy = 'id'; }
		if (order) { sortOrder = order; } else { sortOrder = 'asc'; }

		if (isEmpty(query)) {
			const data = await db('csr_images')
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
		} else {
			const data = await db('csr_images')
				.where(query)
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
		return error;
	}
}
 
export { fileUpload, getCsrFiles };