import db from '../services/db.js';
import { getDataByCode } from '../utilities/getDataByCode.js';
import { getAllData } from '../utilities/getAllData.js';
import { getDataById } from '../utilities/getDataById.js';

// list all users
const getAttendance = async (_req, res, _next) => await getAllData('reports_att', res);
const getAttendanceById = async (req, res, _next) => await getDataById({ id: req.params.id }, 'reports_att', res);
const getAttendanceByParishCode = async (req, res, _next) => await getDataByCode({ parish_code: req.params.parish_code }, 'reports_att', res);
const getAttendanceByAreaCode = async (req, res, _next) => await getDataByCode({ area_code: req.params.area_code }, 'reports_att', res);
const getAttendanceByZoneCode = async (req, res, _next) => await getDataByCode({ zone_code: req.params.zone_code }, 'reports_att', res);
const getAttendanceByProvinceCode = async (req, res, _next) => await getDataByCode({ province_code: req.params.province_code }, 'reports_att', res);
const getAttendanceByRegionCode = async (req, res, _next) => await getDataByCode({ region_code: req.params.region_code }, 'reports_att', res);

const getAttendanceByServiceDate = async (req, res, _next) => {
	try {
		const { service_date } = req.params;
		const data = await db('reports_att').where({ service_date });

		if (data.length > 0) {
			return res.status(200).json({
				status: 'success',
				data: data
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No attendance found for the service date supplied'
			});
		}
	} catch (error) {
		return error
	}
}

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
		const { id } = req.params;
		const attendance = await db('reports_att').where({ id }).update(data).returning(['id', 'service_id', 'month', 'created_at', 'updated_at']);

		if (attendance) {
			return res.status(200).json({
				status: 'success',
				message: 'Attendance updated successfully',
				data: attendance
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No attendance found for the id supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { 
	getAttendance,
	getAttendanceById,
	getAttendanceByParishCode,
	getAttendanceByAreaCode,
	getAttendanceByZoneCode,
	getAttendanceByProvinceCode,
	getAttendanceByRegionCode,
	getAttendanceByServiceDate,
	createAttendance 
};