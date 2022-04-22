import db from '../services/db.js';
import { getAllData } from '../utilities/getAllData.js';

// Get all CSR reports or specific ones based on query parameters
const getCsrReport = async (req, res, _next) => await getAllData(req, res, 'csr_reports');

const createCsrReport = async (req, res, _next) => {
	try {
		const data = req.body;
		const result = await db('csr_reports').insert(data).returning(['id', 'parish_code', 'month', 'created_at', 'updated_at']);
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		return res.json({ error });
	}
}

const updateCsrReport = async (req, res, _next) => {
	try {
		const data = req.body;
		
		const {
			id,
			parish_code,
			area_code,
			zone_code,
			province_code,
			region_code,
			week,
			date_of_activity,
			month,
			year,
			category_id,
			sub_category_id
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (zone_code) query.zone_code = zone_code;
		if (province_code) query.province_code = province_code;
		if (region_code) query.region_code = region_code;
		if (week) query.week = week;
		if (date_of_activity) query.date_of_activity = date_of_activity;
		if (month) query.month = month;
		if (year) query.year = year;
		if (category_id) query.category_id = category_id;
		if (sub_category_id) query.sub_category_id = sub_category_id;

		const result = await db('csr_reports').where(query).first().update(data).returning(['id', 'parish_code', 'month', 'created_at', 'updated_at']);

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'CSR report updated successfully',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No CSR report found for the id supplied'
			});
		}
	} catch (error) {
		return error
	}
}

const deleteCSRReport = async (req, res, _next) => {
	try {
		const {
			id,
			parish_code,
			area_code,
			zone_code,
			province_code,
			region_code,
			week,
			date_of_activity,
			month,
			year,
			category_id,
			sub_category_id
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (zone_code) query.zone_code = zone_code;
		if (province_code) query.province_code = province_code;
		if (region_code) query.region_code = region_code;
		if (week) query.week = week;
		if (date_of_activity) query.date_of_activity = date_of_activity;
		if (month) query.month = month;
		if (year) query.year = year;
		if (category_id) query.category_id = category_id;
		if (sub_category_id) query.sub_category_id = sub_category_id;

		const result = await db('csr_reports').where(query).first().del();

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'CSR report deleted successfully'
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No CSR report found for the id supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { 
	getCsrReport, 
	createCsrReport,
	updateCsrReport,
	deleteCSRReport
};