import db from '../services/db.js';
import { getAllData } from '../utilities/getAllData.js';

// Get all attendance reports or specific ones based on query parameters
const getAttendance = async (req, res, _next) => await getAllData(req, res, 'reports_att');

const createAttendance = async (req, res, _next) => {
	try {
		const data = req.body;
		const { service_id, parish_code, area_code, zone_code, province_code, region_code, service_date, week, month, year } = data;
		let parish_code_check 	= parish_code != '' && parish_code != null;
		let area_code_check 	= area_code != '' && area_code != null;
		let zone_code_check 	= zone_code != '' && zone_code != null;
		let province_code_check = province_code != '' && province_code != null;
		let region_code_check 	= region_code != '' && region_code != null;

		if (parish_code_check && area_code_check && zone_code_check && province_code_check && region_code_check) {

			const attendance = await db('reports_att').where({ service_id, parish_code, service_date, week, month, year });
			
			// if attendance exists, update
			if (attendance.length > 0) {
				const update_attendance = await db('reports_att').where({ id: attendance[0].id }).update(data).returning(['id', 'parish_code', 'service_id', 'month', 'created_at', 'updated_at']);

				const averages = await db('reports_att').avg({
					men: 'men', 
					women: 'women',
					children: 'children'
				}).where({
					service_id: update_attendance[0].service_id,
					parish_code: update_attendance[0].parish_code,
					month: update_attendance[0].month
				}).groupBy('month');

				await db('reports_att').where({ id: update_attendance[0].id }).update({
					avg_men: Math.round(Number(averages[0].men)),
					avg_women: Math.round(Number(averages[0].women)),
					avg_children: Math.round(Number(averages[0].children))
				});

				return res.status(204).json({
					status: 'success',
					message: 'Attendance updated successfully',
					data: update_attendance
				});
			} else {
				// if attendance does not exist, create
				const create_attendance = await db('reports_att').insert(data).returning(['id', 'parish_code', 'service_id', 'month', 'created_at', 'updated_at']);

				const averages = await db('reports_att').avg({
					men: 'men', 
					women: 'women',
					children: 'children'
				}).where({
					service_id: create_attendance[0].service_id,
					parish_code: create_attendance[0].parish_code,
					month: create_attendance[0].month
				}).groupBy('month');

				await db('reports_att').where({ id: create_attendance[0].id }).update({
					avg_men: Math.round(Number(averages[0].men)),
					avg_women: Math.round(Number(averages[0].women)),
					avg_children: Math.round(Number(averages[0].children))
				});

				return res.status(201).json({
					status: 'success',
					message: 'Attendance created successfully',
					data: create_attendance
				});
			}
		} else {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

const updateAttendance = async (req, res, _next) => {
	try {
		const data = req.body;

		const {
			id,
			service_id,
			parish_code,
			area_code,
			zone_code,
			province_code,
			region_code,
			week,
			service_date,
			month,
			year
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (service_id) query.service_id = service_id;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (zone_code) query.zone_code = zone_code;
		if (province_code) query.province_code = province_code;
		if (region_code) query.region_code = region_code;
		if (week) query.week = week;
		if (service_date) query.service_date = service_date;
		if (month) query.month = month;
		if (year) query.year = year;

		const attendance = await db('reports_att').where(query).first().update(data).returning(['id', 'service_id', 'month', 'created_at', 'updated_at']);

		if (attendance) {
			return res.status(200).json({
				status: 'success',
				message: 'Attendance updated successfully',
				data: attendance
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No attendance found for the query data supplied'
			});
		}
	} catch (error) {
		return error
	}
}

const deleteAttendance = async (req, res, _next) => {
	try {
		const {
			id,
			service_id,
			parish_code,
			area_code,
			zone_code,
			province_code,
			region_code,
			week,
			service_date,
			month,
			year
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (service_id) query.service_id = service_id;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (zone_code) query.zone_code = zone_code;
		if (province_code) query.province_code = province_code;
		if (region_code) query.region_code = region_code;
		if (week) query.week = week;
		if (service_date) query.service_date = service_date;
		if (month) query.month = month;
		if (year) query.year = year;

		const attendance = await db('reports_att').where(query).first().del();

		if (attendance) {
			return res.status(200).json({
				status: 'success',
				message: 'Attendance deleted successfully'
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No attendance found for the query data supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { 
	getAttendance,
	createAttendance,
	updateAttendance,
	deleteAttendance
};