import { config } from 'dotenv';
import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import { getQueryData } from '../utils/getQueryData.js';
import { insertIntoDb, getDataFromDb, updateDb, deleteFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular, insertOpsHelper, updateOpsHelper } from '../utils/helpers.js';

config();

// Get all attendance reports or specific ones based on query parameters
const getAttendance = asyncCatchRegular(async (req, res, _next) => {
	const modifyReports = async report => {
		const source_doc = await getDataFromDb(req, db('source_docs'), { report_att_id: report.id });

		if (source_doc) {
			const file_key = source_doc[0]['file_key']
			const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
			source_doc[0]['file_path'] = file_path;
			report['source_doc'] = source_doc;
		}

		return report;
	}

	const reports = await getDataFromDb(req, db('reports_att'));
	
	if (reports) {
		const addFilesToReport = reports.map(modifyReports);

		const attReports = await Promise.all(addFilesToReport);

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

const createAttendance = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { service_id, parish_code, week, month, year } = data;

	const foundAttendanceData = await getDataFromDb(req, db('reports_att'), { service_id, parish_code, week, month, year });

	const foundMonthlyAtt = await getDataFromDb(req, db('reports_att_monthly'), {
		service_id: service_id,
		parish_code: parish_code,
		month: month,
		year: year
	});

	// if attendance exists, update
	if (foundAttendanceData) {
		const monthlyAttData = await computeMonthlyData(req, data, 'update');

		if (isEmpty(monthlyAttData) || monthlyAttData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating monthly data.'
			});
		}
		
		if (foundMonthlyAtt) {
			// if attendance for this month exists, update
			const updateMonthlyAttData = await updateDb(db('reports_att_monthly'), monthlyAttData, { id: foundMonthlyAtt[0].id });
			await updateOpsHelper(updateDb, updateMonthlyAttData, db('reports_att'), data, { id: foundAttendanceData[0].id }, res);
		} else {
			// if attendance for this month does not exist, create
			const createMonthlyAttData = insertIntoDb(db('reports_att_monthly'), monthlyAttData);
			await updateOpsHelper(updateDb, createMonthlyAttData, db('reports_att'), data, { id: foundAttendanceData[0].id }, res);
		}
	} else {
		const monthlyAttData = await computeMonthlyData(req, data, 'insert');

		if (isEmpty(monthlyAttData) || monthlyAttData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting monthly data.'
			});
		}

		if (foundMonthlyAtt) {
			// if attendance for this month exists, update
			const updateMonthlyAttData = await updateDb(db('reports_att_monthly'), monthlyAttData, { id: foundMonthlyAtt[0].id });
			await insertOpsHelper(insertIntoDb, updateMonthlyAttData, db('reports_att'), data, res);
		} else {
			// if attendance for this month does not exist, create
			const insertMonthlyAttData = await insertIntoDb(db('reports_att_monthly'), monthlyAttData);
			await insertOpsHelper(insertIntoDb, insertMonthlyAttData, db('reports_att'), data, res);
		}
	}
});

const computeMonthlyData = async (req, attendanceData, ops) => {
	try {
		const default_report_query = {
			service_id: attendanceData['service_id'],
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const further_report_query = {
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const people_obj = {
			men: 'men', 
			women: 'women',
			children: 'children'
		};

		const further_report_obj = {
			marriages: 'marriages', 
			births: 'births',
			demises: 'demises',
			converts: 'converts',
			first_timers: 'first_timers',
			hf_centres: 'hf_centres',
			unord_ministers: 'unord_ministers',
			bapt_workers: 'bapt_workers',
			bapt_members: 'bapt_members',
			att_s_prog: 'att_s_prog',
			att_vigil: 'att_vigil',
			new_workers: 'new_workers',
			asst_pastors: 'asst_pastors',
			full_pastors: 'full_pastors',
			dcns: 'dcns'
		};

		const default_report_cols = [
			'service_id', 'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'sub_cont_code', 'cont_code', 'month', 'year'
		];

		const monthlyData = {};
	
		const weeksCount = await db('reports_att').count('week').where(default_report_query);

		let monthly_sum, numWeeks;
	
		if (ops === 'insert') {
			monthly_sum = await db('reports_att').sum(people_obj).where(default_report_query);
			numWeeks = Number(weeksCount[0].count) + 1;
		}

		if (ops === 'update') {
			const dbData = await getDataFromDb(req, db('reports_att'), {
				service_id: attendanceData['service_id'],
				parish_code: attendanceData['parish_code'],
				week: attendanceData['week'],
				month: attendanceData['month'],
				year: attendanceData['year'],
				service_date: attendanceData['service_date']
			});

			monthly_sum = await db('reports_att')
								.sum(people_obj)
								.where(default_report_query)
								.andWhereNot({id: dbData[0].id});
			numWeeks = Number(weeksCount[0].count);
		}

		const men 	= Number(monthly_sum[0]['men']) + (attendanceData['men'] ? attendanceData['men'] : 0);
		const women 	= Number(monthly_sum[0]['women']) + (attendanceData['women'] ? attendanceData['women'] : 0);
		const children = Number(monthly_sum[0]['children']) + (attendanceData['children'] ? attendanceData['children'] : 0);
		const total_mwc = men + women + children

		const avg_men = Math.round(men / numWeeks);
		const avg_women = Math.round(women / numWeeks);
		const avg_children = Math.round(children / numWeeks);
		const avg_total = avg_men + avg_women + avg_children;
	
		const further_reports_monthly_sum = await db('reports_att').sum(further_report_obj).where(further_report_query);

		for (let col of default_report_cols) {
			monthlyData[col] = attendanceData[col];
		}

		for (let value of Object.values(further_report_obj)) {
			monthlyData[value] = Number(further_reports_monthly_sum[0][value]) + (attendanceData[value] ? attendanceData[value] : 0);
		}

		monthlyData['men'] 			= men;
		monthlyData['women'] 		= women;
		monthlyData['children'] 	= children;
		monthlyData['total_mwc'] 	= total_mwc;
		monthlyData['avg_men'] 		= avg_men;
		monthlyData['avg_women'] 	= avg_women;
		monthlyData['avg_children'] = avg_children;
		monthlyData['avg_total'] 	= avg_total;
	
		return monthlyData;
	} catch (error) {
		console.error(error);

		return {
			error: error.message
		}
	}
}

const deleteAttendance = asyncCatchRegular (async (req, res, _next) => {
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
});

const getMonthlyAttendance = asyncCatchRegular (async (req, res, _next) => {
	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const monthlyReport = await db('reports_att_monthly')
						.where(query_data)
						.limit(limitNum)
						.offset(pageNum * limitNum)
						.orderBy(sortBy, sortOrder);

	if (monthlyReport.length > 0) {
		return res.status(200).json({
			status: 'success',
			data: monthlyReport
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance
};